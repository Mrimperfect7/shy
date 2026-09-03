import { prisma } from '@/lib/db'
import { DiscountType, CouponStatus } from '@prisma/client'

export interface CouponValidationResult {
  valid: boolean
  error?: string
  discountType?: DiscountType
  discountValue?: number
  calculatedDiscount?: number
  couponCode?: string
  couponId?: string
  influencerId?: string | null
}

export function calculateDiscount(
  discountType: DiscountType,
  discountValue: number,
  orderAmount: number,
  maximumDiscount: number | null
): number {
  if (discountType === DiscountType.FIXED_AMOUNT) {
    return Math.min(discountValue, orderAmount)
  }

  // Percentage
  const calculated = (orderAmount * discountValue) / 100
  if (maximumDiscount && calculated > maximumDiscount) {
    return maximumDiscount
  }
  return calculated
}

export async function validateCoupon(
  code: string,
  orderAmount: number
): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase()

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
    include: { influencer: true },
  })

  if (!coupon) {
    return { valid: false, error: 'This coupon code does not exist.' }
  }

  if (coupon.status === CouponStatus.INACTIVE) {
    return { valid: false, error: 'This coupon is currently inactive.' }
  }

  if (coupon.status === CouponStatus.EXPIRED) {
    return { valid: false, error: 'This coupon has expired.' }
  }

  if (coupon.expiryDate && new Date() > coupon.expiryDate) {
    // Auto-expire
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { status: CouponStatus.EXPIRED },
    })
    return { valid: false, error: 'This coupon has expired.' }
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, error: 'This coupon has reached its usage limit.' }
  }

  if (coupon.minimumOrderValue !== null && orderAmount < coupon.minimumOrderValue) {
    const remaining = coupon.minimumOrderValue - orderAmount
    return {
      valid: false,
      error: `Add ₹${remaining.toFixed(0)} more to use this coupon.`,
    }
  }

  const calculatedDiscount = calculateDiscount(
    coupon.discountType,
    coupon.discountValue,
    orderAmount,
    coupon.maximumDiscount
  )

  return {
    valid: true,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    calculatedDiscount,
    couponCode: coupon.code,
    couponId: coupon.id,
    influencerId: coupon.influencerId,
  }
}

export async function incrementCouponUsage(couponId: string): Promise<void> {
  await prisma.coupon.update({
    where: { id: couponId },
    data: { usageCount: { increment: 1 } },
  })
}

export async function getCoupons(options?: {
  influencerId?: string
  status?: CouponStatus
}) {
  return prisma.coupon.findMany({
    where: {
      ...(options?.influencerId ? { influencerId: options.influencerId } : {}),
      ...(options?.status ? { status: options.status } : {}),
    },
    include: {
      influencer: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createCoupon(data: {
  code: string
  influencerId?: string
  discountType: DiscountType
  discountValue: number
  minimumOrderValue?: number
  maximumDiscount?: number
  expiryDate?: Date
  usageLimit?: number
}) {
  return prisma.coupon.create({
    data: {
      code: data.code.trim().toUpperCase(),
      influencerId: data.influencerId,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minimumOrderValue: data.minimumOrderValue,
      maximumDiscount: data.maximumDiscount,
      expiryDate: data.expiryDate,
      usageLimit: data.usageLimit,
      status: CouponStatus.ACTIVE,
    },
  })
}

export async function updateCoupon(
  id: string,
  data: Partial<{
    code: string
    discountType: DiscountType
    discountValue: number
    minimumOrderValue: number | null
    maximumDiscount: number | null
    expiryDate: Date | null
    usageLimit: number | null
    status: CouponStatus
  }>
) {
  return prisma.coupon.update({
    where: { id },
    data: {
      ...data,
      ...(data.code ? { code: data.code.trim().toUpperCase() } : {}),
    },
  })
}

export async function deleteCoupon(id: string) {
  return prisma.coupon.delete({ where: { id } })
}

export async function getCouponAnalytics(couponId: string) {
  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
    include: {
      influencer: { include: { user: true } },
      attributions: {
        select: {
          orderValue: true,
          discountValue: true,
          netOrderValue: true,
          commissionValue: true,
          createdAt: true,
        },
      },
    },
  })

  if (!coupon) return null

  const totalUses = coupon.attributions.length
  const totalRevenue = coupon.attributions.reduce((sum, a) => sum + a.netOrderValue, 0)
  const totalDiscount = coupon.attributions.reduce((sum, a) => sum + a.discountValue, 0)
  const avgOrderValue = totalUses > 0 ? totalRevenue / totalUses : 0
  const totalCommission = coupon.attributions.reduce((sum, a) => sum + a.commissionValue, 0)

  return {
    coupon,
    totalUses,
    totalRevenue,
    totalDiscount,
    avgOrderValue,
    totalCommission,
  }
}
