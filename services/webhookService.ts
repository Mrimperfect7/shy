import { prisma } from '@/lib/db'
import { CommissionStatus } from '@prisma/client'
import type { ShopifyWebhookOrder } from '@/lib/shopify/types'

export async function processOrderCreated(order: ShopifyWebhookOrder): Promise<void> {
  const shopifyOrderId = order.id.toString()

  // Idempotency: check if already processed
  const alreadyProcessed = await prisma.processedWebhook.findUnique({
    where: { topic_shopifyId: { topic: 'orders/create', shopifyId: shopifyOrderId } },
  })
  if (alreadyProcessed) {
    console.log(`Webhook orders/create already processed for order ${shopifyOrderId}`)
    return
  }

  // Decrement inventory for each purchased item
  if (order.line_items && order.line_items.length > 0) {
    for (const item of order.line_items) {
      // Find the local product matching the Shopify product title
      const localProduct = await prisma.product.findFirst({
        where: { title: item.title }
      });
      if (localProduct && localProduct.inventory >= item.quantity) {
        await prisma.product.update({
          where: { id: localProduct.id },
          data: { inventory: { decrement: item.quantity } }
        });
      }
    }
  }

  // Extract discount codes
  const discountCode = order.discount_codes?.[0]?.code
  if (!discountCode) {
    // No coupon applied — mark as processed and return
    await markWebhookProcessed('orders/create', shopifyOrderId)
    return
  }

  const normalizedCode = discountCode.trim().toUpperCase()

  // 1. Check if it's a Coupon in our database
  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
    include: { influencer: true },
  })

  // 2. Check if it's a Referral Reward in our database
  const referralReward = !coupon ? await prisma.referralReward.findUnique({
    where: { couponCode: normalizedCode },
  }) : null

  if (referralReward && !referralReward.isRedeemed) {
    await prisma.referralReward.update({
      where: { id: referralReward.id },
      data: { isRedeemed: true },
    })
    await markWebhookProcessed('orders/create', shopifyOrderId)
    return
  }

  if (!coupon) {
    await markWebhookProcessed('orders/create', shopifyOrderId)
    return
  }

  // If coupon exists but has no influencer (General / Direct Promo Code):
  if (!coupon.influencerId || !coupon.influencer) {
    // Increment coupon usage count on successful placed order
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usageCount: { increment: 1 } },
    })
    await markWebhookProcessed('orders/create', shopifyOrderId)
    return
  }

  // If coupon is assigned to an influencer:
  const influencer = coupon.influencer
  const orderValue = parseFloat(order.total_price)
  const discountValue = parseFloat(order.total_discounts || "0")
  const netOrderValue = orderValue - discountValue
  const commissionValue = (netOrderValue * influencer.commissionRate) / 100

  // Create attribution, commission, and increment usage in a transaction
  await prisma.$transaction(async (tx) => {
    const attribution = await tx.orderAttribution.create({
      data: {
        shopifyOrderId,
        shopifyOrderName: order.name,
        influencerId: influencer.id,
        couponId: coupon.id,
        couponCode: normalizedCode,
        orderValue,
        discountValue,
        netOrderValue,
        commissionRate: influencer.commissionRate,
        commissionValue,
        currency: order.currency || "INR",
      },
    })

    await tx.commission.create({
      data: {
        influencerId: influencer.id,
        orderAttributionId: attribution.id,
        amount: commissionValue,
        status: CommissionStatus.PENDING,
      },
    })

    // Update influencer stats
    await tx.influencer.update({
      where: { id: influencer.id },
      data: {
        totalSales: { increment: netOrderValue },
        totalOrders: { increment: 1 },
        totalCommission: { increment: commissionValue },
      },
    })

    // Update coupon usage count upon successful placed order
    await tx.coupon.update({
      where: { id: coupon.id },
      data: { usageCount: { increment: 1 } },
    })

    await markWebhookProcessed('orders/create', shopifyOrderId, tx)
  })
}

export async function processRefundCreated(
  refund: { order_id: number; id: number },
  order: ShopifyWebhookOrder
): Promise<void> {
  const shopifyOrderId = order.id.toString()
  const refundId = refund.id.toString()

  const alreadyProcessed = await prisma.processedWebhook.findUnique({
    where: { topic_shopifyId: { topic: 'refunds/create', shopifyId: refundId } },
  })
  if (alreadyProcessed) return

  const attribution = await prisma.orderAttribution.findUnique({
    where: { shopifyOrderId },
    include: { commission: true },
  })

  if (!attribution) {
    const discountCode = order.discount_codes?.[0]?.code
    if (discountCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: discountCode.trim().toUpperCase() } })
      if (coupon && coupon.usageCount > 0) {
        await prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { decrement: 1 } } })
      }
    }
    await markWebhookProcessed('refunds/create', refundId)
    return
  }

  await prisma.$transaction(async (tx) => {
    // Cancel pending commission
    if (attribution.commission && attribution.commission.status === CommissionStatus.PENDING) {
      await tx.commission.update({
        where: { id: attribution.commission.id },
        data: { status: CommissionStatus.CANCELLED },
      })
    }

    // Mark attribution as refunded
    await tx.orderAttribution.update({
      where: { id: attribution.id },
      data: { refunded: true, refundedAt: new Date() },
    })

    // Reverse influencer stats
    await tx.influencer.update({
      where: { id: attribution.influencerId },
      data: {
        totalSales: { decrement: attribution.netOrderValue },
        totalOrders: { decrement: 1 },
        totalCommission: { decrement: attribution.commissionValue },
      },
    })

    // Rollback coupon usage count
    if (attribution.couponId) {
      const c = await tx.coupon.findUnique({ where: { id: attribution.couponId } })
      if (c && c.usageCount > 0) {
        await tx.coupon.update({
          where: { id: attribution.couponId },
          data: { usageCount: { decrement: 1 } },
        })
      }
    }

    await markWebhookProcessed('refunds/create', refundId, tx)
  })
}

export async function processOrderCancelled(order: ShopifyWebhookOrder): Promise<void> {
  const shopifyOrderId = order.id.toString()

  const alreadyProcessed = await prisma.processedWebhook.findUnique({
    where: { topic_shopifyId: { topic: 'orders/cancelled', shopifyId: shopifyOrderId } },
  })
  if (alreadyProcessed) return

  const attribution = await prisma.orderAttribution.findUnique({
    where: { shopifyOrderId },
    include: { commission: true },
  })

  if (!attribution) {
    const discountCode = order.discount_codes?.[0]?.code
    if (discountCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: discountCode.trim().toUpperCase() } })
      if (coupon && coupon.usageCount > 0) {
        await prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { decrement: 1 } } })
      }
    }
    await markWebhookProcessed('orders/cancelled', shopifyOrderId)
    return
  }

  await prisma.$transaction(async (tx) => {
    if (attribution.commission && attribution.commission.status === CommissionStatus.PENDING) {
      await tx.commission.update({
        where: { id: attribution.commission.id },
        data: { status: CommissionStatus.CANCELLED },
      })
    }

    await tx.orderAttribution.update({
      where: { id: attribution.id },
      data: { refunded: true, refundedAt: new Date() },
    })

    await tx.influencer.update({
      where: { id: attribution.influencerId },
      data: {
        totalSales: { decrement: attribution.netOrderValue },
        totalOrders: { decrement: 1 },
        totalCommission: { decrement: attribution.commissionValue },
      },
    })

    // Rollback coupon usage count
    if (attribution.couponId) {
      const c = await tx.coupon.findUnique({ where: { id: attribution.couponId } })
      if (c && c.usageCount > 0) {
        await tx.coupon.update({
          where: { id: attribution.couponId },
          data: { usageCount: { decrement: 1 } },
        })
      }
    }

    await markWebhookProcessed('orders/cancelled', shopifyOrderId, tx)
  })
}

export function verifyShopifyWebhook(
  body: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto')
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64')
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
}

async function markWebhookProcessed(
  topic: string,
  shopifyId: string,
  tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<void> {
  const db = tx || prisma
  await db.processedWebhook.create({
    data: { topic, shopifyId },
  })
}
