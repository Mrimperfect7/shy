import prisma from "@/lib/prisma";
import { CommissionStatus } from "@prisma/client";

/**
 * Attributes a paid order to an Influencer or Referral Reward,
 * calculates commissions, and automatically updates the Influencer Dashboard stats.
 */
export async function recordOrderAttributionAndCommission(orderNumber: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return { success: false, reason: "Order not found" };
    }

    const isPaid = order.status === "PAID" || order.status === "SHIPPED" || order.status === "DELIVERED";
    if (!isPaid) {
      return { success: false, reason: "Order is not in PAID/CONFIRMED status" };
    }

    const shipping = (order.shippingAddress as any) || {};
    const couponCode = shipping.couponCode;

    if (!couponCode || !couponCode.trim()) {
      return { success: false, reason: "No coupon applied on this order" };
    }

    const normalizedCode = couponCode.trim().toUpperCase();

    // 1. Check idempotency: avoid attributing the same order twice
    const existingAttribution = await prisma.orderAttribution.findUnique({
      where: { shopifyOrderId: order.orderNumber },
    });

    if (existingAttribution) {
      return { success: true, message: "Order already attributed" };
    }

    // 2. Fetch the coupon with linked influencer
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
      include: { influencer: true },
    });

    // 3. Also check if this code was a referral reward
    const referralReward = !coupon
      ? await prisma.referralReward.findUnique({
          where: { couponCode: normalizedCode },
        })
      : null;

    if (referralReward && !referralReward.isRedeemed) {
      await prisma.referralReward.update({
        where: { id: referralReward.id },
        data: { isRedeemed: true },
      });
      return { success: true, message: "Referral reward redeemed" };
    }

    if (!coupon) {
      return { success: false, reason: "Coupon not found" };
    }

    // 4. Increment coupon usage count
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usageCount: { increment: 1 } },
    });

    // 5. If coupon is assigned to an influencer, credit commission & update stats
    if (coupon.influencerId && coupon.influencer) {
      const influencer = coupon.influencer;
      const orderValue = order.totalAmount;
      const discountValue = Number(shipping.discountAmount || 0);
      const netOrderValue = orderValue;
      const commissionValue = (netOrderValue * influencer.commissionRate) / 100;

      await prisma.$transaction(async (tx) => {
        const attribution = await tx.orderAttribution.create({
          data: {
            shopifyOrderId: order.orderNumber,
            shopifyOrderName: order.orderNumber,
            influencerId: influencer.id,
            couponId: coupon.id,
            couponCode: normalizedCode,
            orderValue,
            discountValue,
            netOrderValue,
            commissionRate: influencer.commissionRate,
            commissionValue,
            currency: "INR",
          },
        });

        await tx.commission.create({
          data: {
            influencerId: influencer.id,
            orderAttributionId: attribution.id,
            amount: commissionValue,
            status: CommissionStatus.PENDING,
          },
        });

        await tx.influencer.update({
          where: { id: influencer.id },
          data: {
            totalSales: { increment: netOrderValue },
            totalOrders: { increment: 1 },
            totalCommission: { increment: commissionValue },
          },
        });
      });

      console.log(
        `[Influencer Attribution] Successfully credited ₹${commissionValue} to Influencer ${influencer.id} for Order #${order.orderNumber}`
      );
      return { success: true, attributedTo: influencer.id, commission: commissionValue };
    }

    return { success: true, message: "General coupon usage incremented" };
  } catch (error: any) {
    console.error("[recordOrderAttributionAndCommission] Error:", error);
    return { success: false, error: error.message };
  }
}
