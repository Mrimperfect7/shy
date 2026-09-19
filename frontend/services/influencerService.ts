import { prisma } from '@/lib/db'
import { CommissionStatus, PayoutStatus } from '@prisma/client'

export async function getInfluencerDashboard(influencerId: string) {
  const influencer = await prisma.influencer.findUnique({
    where: { id: influencerId },
    include: {
      user: { select: { name: true, email: true } },
      coupons: {
        include: {
          attributions: {
            select: {
              orderValue: true,
              netOrderValue: true,
              commissionValue: true,
              createdAt: true,
            },
          },
        },
      },
      attributions: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          shopifyOrderId: true,
          shopifyOrderName: true,
          orderValue: true,
          discountValue: true,
          netOrderValue: true,
          commissionValue: true,
          couponCode: true,
          createdAt: true,
          refunded: true,
        },
      },
      commissions: {
        select: {
          amount: true,
          status: true,
          createdAt: true,
          approvedAt: true,
          paidAt: true,
        },
      },
      payouts: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          status: true,
          paidAt: true,
          createdAt: true,
        },
      },
    },
  })

  if (!influencer) return null

  const pendingCommission = influencer.commissions
    .filter((c) => c.status === CommissionStatus.PENDING)
    .reduce((sum, c) => sum + c.amount, 0)

  const approvedCommission = influencer.commissions
    .filter((c) => c.status === CommissionStatus.APPROVED)
    .reduce((sum, c) => sum + c.amount, 0)

  const paidCommission = influencer.commissions
    .filter((c) => c.status === CommissionStatus.PAID)
    .reduce((sum, c) => sum + c.amount, 0)

  // Daily sales for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const dailySales = await prisma.orderAttribution.groupBy({
    by: ['createdAt'],
    where: {
      influencerId,
      createdAt: { gte: thirtyDaysAgo },
      refunded: false,
    },
    _sum: { netOrderValue: true },
    _count: { id: true },
  })

  // Compute verified paid sales metrics directly from attributions
  const verifiedPaidSales = influencer.attributions
    .filter((a) => !a.refunded)
    .reduce((sum, a) => sum + a.netOrderValue, 0);

  const verifiedPaidOrders = influencer.attributions
    .filter((a) => !a.refunded)
    .length;

  const totalCalculatedCommission = pendingCommission + approvedCommission + paidCommission;

  return {
    influencer: {
      id: influencer.id,
      name: influencer.user.name,
      email: influencer.user.email,
      commissionRate: influencer.commissionRate,
      instagramHandle: influencer.instagramHandle,
      upiId: influencer.upiId,
    },
    stats: {
      totalSales: verifiedPaidSales,
      totalOrders: verifiedPaidOrders,
      totalCommission: totalCalculatedCommission,
      conversionRate: 0, // would need click tracking
    },
    coupons: influencer.coupons.map((c) => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      usageCount: c.usageCount,
      usageLimit: c.usageLimit,
      status: c.status,
      totalRevenue: c.attributions.reduce((sum, a) => sum + a.netOrderValue, 0),
      totalOrders: c.attributions.length,
    })),
    recentOrders: influencer.attributions,
    commissions: {
      pending: pendingCommission,
      approved: approvedCommission,
      paid: paidCommission,
      total: totalCalculatedCommission,
    },
    payouts: influencer.payouts,
    dailySales,
  }
}

export async function getInfluencers() {
  const influencers = await prisma.influencer.findMany({
    include: {
      user: { select: { name: true, email: true, isActive: true } },
      coupons: { select: { code: true, status: true, usageCount: true } },
      attributions: {
        where: { refunded: false },
        select: { netOrderValue: true, commissionValue: true, shopifyOrderId: true }
      },
      commissions: {
        where: { status: { not: CommissionStatus.CANCELLED } },
        select: { amount: true, status: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return influencers.map(inf => {
    // Strictly calculate total sales and orders from verified, non-refunded paid order attributions
    const verifiedSales = inf.attributions.reduce((sum, a) => sum + a.netOrderValue, 0);
    const verifiedOrders = inf.attributions.length;
    const verifiedCommission = inf.commissions.reduce((sum, c) => sum + c.amount, 0);

    return {
      ...inf,
      totalSales: verifiedSales,
      totalOrders: verifiedOrders,
      totalCommission: verifiedCommission,
    };
  }).sort((a, b) => b.totalSales - a.totalSales);
}

export async function createInfluencer(data: {
  name: string
  email: string
  passwordHash: string
  instagramHandle?: string
  phone?: string
  commissionRate: number
}) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: 'INFLUENCER',
      },
    })

    const influencer = await tx.influencer.create({
      data: {
        userId: user.id,
        instagramHandle: data.instagramHandle,
        phone: data.phone,
        commissionRate: data.commissionRate,
      },
    })

    return { user, influencer }
  })
}

export async function updateInfluencer(
  id: string,
  data: Partial<{
    commissionRate: number
    instagramHandle: string
    phone: string
    notes: string
    isActive: boolean
  }>
) {
  const { isActive, ...influencerData } = data

  return prisma.$transaction(async (tx) => {
    const influencer = await tx.influencer.update({
      where: { id },
      data: influencerData,
    })

    if (isActive !== undefined) {
      await tx.user.update({
        where: { id: influencer.userId },
        data: { isActive },
      })

      if (isActive === false) {
        await tx.coupon.updateMany({
          where: { influencerId: id, status: 'ACTIVE' },
          data: { status: 'EXPIRED' },
        })
      }
    }

    return influencer
  })
}

export async function getAdminAnalytics(
  startDate: Date,
  endDate: Date
) {
  const [attributions, commissions, influencers] = await Promise.all([
    prisma.orderAttribution.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        refunded: false,
      },
      include: {
        influencer: { include: { user: { select: { name: true } } } },
        coupon: { select: { code: true, discountType: true, discountValue: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.commission.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { not: CommissionStatus.CANCELLED },
      },
    }),
    prisma.influencer.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { totalSales: 'desc' },
      take: 10,
    }),
  ])

  const totalRevenue = attributions.reduce((sum, a) => sum + a.netOrderValue, 0)
  const totalOrders = attributions.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const totalDiscount = attributions.reduce((sum, a) => sum + a.discountValue, 0)
  const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0)

  // Group by influencer
  const influencerStats: Record<string, { name: string; revenue: number; orders: number; commission: number }> = {}
  for (const attr of attributions) {
    const name = attr.influencer.user.name
    if (!influencerStats[attr.influencerId]) {
      influencerStats[attr.influencerId] = { name, revenue: 0, orders: 0, commission: 0 }
    }
    influencerStats[attr.influencerId].revenue += attr.netOrderValue
    influencerStats[attr.influencerId].orders += 1
    influencerStats[attr.influencerId].commission += attr.commissionValue
  }

  // Group by coupon
  const couponStats: Record<string, { code: string; revenue: number; orders: number; discount: number }> = {}
  for (const attr of attributions) {
    if (!couponStats[attr.couponCode]) {
      couponStats[attr.couponCode] = { code: attr.couponCode, revenue: 0, orders: 0, discount: 0 }
    }
    couponStats[attr.couponCode].revenue += attr.netOrderValue
    couponStats[attr.couponCode].orders += 1
    couponStats[attr.couponCode].discount += attr.discountValue
  }

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    totalDiscount,
    totalCommission,
    influencerStats: Object.values(influencerStats).sort((a, b) => b.revenue - a.revenue),
    couponStats: Object.values(couponStats).sort((a, b) => b.revenue - a.revenue),
    topInfluencers: influencers,
    recentOrders: attributions.slice(0, 20),
  }
}

export async function getPendingPayouts() {
  return prisma.commission.findMany({
    where: { status: CommissionStatus.PENDING },
    include: {
      influencer: { include: { user: { select: { name: true, email: true } } } },
      orderAttribution: {
        select: { shopifyOrderName: true, netOrderValue: true, createdAt: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function approveCommission(commissionId: string) {
  return prisma.commission.update({
    where: { id: commissionId },
    data: { status: CommissionStatus.APPROVED, approvedAt: new Date() },
  })
}

export async function markPayoutPaid(payoutId: string) {
  const payout = await prisma.payout.update({
    where: { id: payoutId },
    data: { status: PayoutStatus.PAID, paidAt: new Date() },
    include: { commissions: true },
  })

  // Update all commissions in this payout
  await prisma.commission.updateMany({
    where: { payoutId },
    data: { status: CommissionStatus.PAID, paidAt: new Date() },
  })

  return payout
}

export async function createPayout(influencerId: string, commissionIds: string[]) {
  const commissions = await prisma.commission.findMany({
    where: {
      id: { in: commissionIds },
      influencerId,
      status: CommissionStatus.APPROVED,
    },
  })

  const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0)

  return prisma.$transaction(async (tx) => {
    const payout = await tx.payout.create({
      data: {
        influencerId,
        amount: totalAmount,
        status: PayoutStatus.PENDING,
      },
    })

    await tx.commission.updateMany({
      where: { id: { in: commissionIds } },
      data: { payoutId: payout.id },
    })

    return payout
  })
}

export async function getAllPayoutRequests() {
  return prisma.payout.findMany({
    include: {
      influencer: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
