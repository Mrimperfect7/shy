"use server";

import prisma from "@/lib/prisma";
import crypto from "crypto";
import { getRazorpayInstance } from "@/lib/razorpay";
import { notifyAdminTransactionVerification } from "@/lib/notifications/admin-notify";
import { sendTelegramOrderAlert } from "@/lib/notifications/telegram";
import { recordOrderAttributionAndCommission } from "@/lib/attribution";

export interface CreateRazorpayOrderInput {
  name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  items: Array<{ id: string; quantity: number; title: string; price?: number }>;
  couponCode?: string | null;
}

/**
 * Creates an authoritative DB Order and corresponding Razorpay Order instance.
 */
export async function createRazorpayOrderAction(input: CreateRazorpayOrderInput) {
  try {
    const { name, email = "", phone, address, city, state, pinCode, items, couponCode } = input;

    if (!name || !phone || !address || !city || !state || !pinCode || !items || items.length === 0) {
      return { success: false, error: "Please fill in all required delivery details." };
    }

    // 1. Authoritative Price Calculation & Coupon Verification in Parallel
    const productIds = items.map((i) => i.id);
    const normalizedCouponCode = couponCode && couponCode.trim() ? couponCode.trim().toUpperCase() : null;

    const [dbProducts, activeOffer, coupon] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, slug: true, title: true }
      }),
      prisma.offerSettings.findUnique({
        where: { id: "singleton" },
      }),
      normalizedCouponCode ? prisma.coupon.findUnique({ where: { code: normalizedCouponCode } }) : Promise.resolve(null),
    ]);

    let calculatedSubtotal = 0;
    const validatedOrderItems = items.map((cartItem) => {
      const dbProd = dbProducts.find((p) => p.id === cartItem.id);
      let baseUnitPrice = dbProd ? dbProd.price : cartItem.price || 0;

      if (activeOffer?.isActive && dbProd) {
        if (
          activeOffer.href.includes(dbProd.slug) ||
          activeOffer.href.includes("shop") ||
          activeOffer.title.toLowerCase().includes("hair oil") ||
          dbProd.slug.includes("hair-oil")
        ) {
          baseUnitPrice = activeOffer.salePrice;
        }
      }

      let unitPrice = baseUnitPrice;
      if (cartItem.price && cartItem.price > 0 && cartItem.price <= baseUnitPrice) {
        unitPrice = cartItem.price;
      }

      calculatedSubtotal += unitPrice * cartItem.quantity;
      return {
        productId: cartItem.id,
        quantity: cartItem.quantity,
        price: unitPrice,
      };
    });

    if (calculatedSubtotal <= 0) {
      return { success: false, error: "Invalid cart contents." };
    }

    // 2. Authoritative Coupon Verification
    let discountAmount = 0;
    let validCouponCode: string | null = null;

    if (coupon && coupon.status === "ACTIVE") {
      if (!coupon.minimumOrderValue || calculatedSubtotal >= coupon.minimumOrderValue) {
        if (!coupon.expiryDate || new Date() <= coupon.expiryDate) {
          validCouponCode = coupon.code;
          if (coupon.discountType === "PERCENTAGE") {
            let disc = (calculatedSubtotal * coupon.discountValue) / 100;
            if (coupon.maximumDiscount && disc > coupon.maximumDiscount) {
              disc = coupon.maximumDiscount;
            }
            discountAmount = disc;
          } else {
            discountAmount = Math.min(coupon.discountValue, calculatedSubtotal);
          }
        }
      }
    }

    const SHIPPING_FEE = 40;
    const finalTotal = Math.max(1, Math.round(calculatedSubtotal - discountAmount + SHIPPING_FEE));
    const amountInPaise = finalTotal * 100;

    const orderNumber = `SHYN-${Date.now().toString().slice(-6)}`;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("[createRazorpayOrderAction] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
      return { success: false, error: "Payment gateway is not configured properly." };
    }

    let razorpayOrderId = "";

    try {
      const razorpay = getRazorpayInstance();
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: orderNumber,
        notes: {
          customerName: name,
          customerPhone: phone,
          orderNumber,
        },
      });
      razorpayOrderId = rzpOrder.id;
    } catch (rzpErr: any) {
      console.error("[Razorpay Orders Create Error]:", rzpErr.message || rzpErr);
      return { success: false, error: "Failed to initialize payment gateway. Please try again later." };
    }

    // 3. Create Order & PaymentAttempt in Database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: {
          address,
          city,
          state,
          pinCode,
          paymentMethod: "RAZORPAY",
          couponCode: validCouponCode,
          discountAmount,
          shippingFee: SHIPPING_FEE,
        },
        totalAmount: finalTotal,
        status: "PENDING",
        paymentId: razorpayOrderId,
        orderItems: {
          create: validatedOrderItems,
        },
        paymentAttempts: {
          create: {
            amount: finalTotal,
            currency: "INR",
            method: "RAZORPAY",
            status: "PENDING",
            paymentReference: razorpayOrderId,
          },
        },
      },
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId,
      amount: amountInPaise,
      amountInRupees: finalTotal,
      currency: "INR",
      keyId,
      customer: {
        name,
        email,
        phone,
      },
    };
  } catch (error: any) {
    console.error("[createRazorpayOrderAction] Error:", error);
    return { success: false, error: error.message || "Failed to create payment order." };
  }
}

export interface VerifyRazorpayPaymentInput {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}

/**
 * Verifies Razorpay payment signature and marks order as PAID.
 */
export async function verifyRazorpayPaymentAction(input: VerifyRazorpayPaymentInput) {
  try {
    const { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;

    if (!orderNumber || !razorpayPaymentId) {
      return { success: false, error: "Missing payment verification parameters." };
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error("[verifyRazorpayPaymentAction] Missing RAZORPAY_KEY_SECRET");
      return { success: false, error: "Payment verification configuration error." };
    }
    
    if (!razorpaySignature || !razorpayOrderId) {
      console.error("[verifyRazorpayPaymentAction] Missing signature or orderId");
      return { success: false, error: "Missing payment verification parameters." };
    }

    // Cryptographically verify signature
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      console.error("[verifyRazorpayPaymentAction] Signature mismatch");
      return { success: false, error: "Payment signature verification failed." };
    }

    // Update order status in Database to PAID
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { orderNumber },
        data: {
          status: "PAID",
          paymentId: razorpayPaymentId,
        },
      }),
      prisma.paymentAttempt.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          currency: "INR",
          method: "RAZORPAY",
          status: "PAID",
          paymentReference: razorpayPaymentId,
          verifiedAt: new Date(),
        },
      }),
    ]);

    const rawAddress: any = order.shippingAddress || {};

    // ── Non-blocking background side effects (Returns response to client instantly) ──
    Promise.allSettled([
      // 1. Credit influencer commission
      recordOrderAttributionAndCommission(orderNumber),

      // 2. Telegram Push Notification to Admin Phone
      sendTelegramOrderAlert({
        orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount,
        paymentMethod: "Razorpay",
        paymentId: razorpayPaymentId,
        couponCode: rawAddress?.couponCode,
        discountAmount: Number(rawAddress?.discountAmount || 0),
        address: {
          street: rawAddress?.address,
          city: rawAddress?.city,
          state: rawAddress?.state,
          pinCode: rawAddress?.pinCode,
        },
        items: order.orderItems.map(item => ({
          title: item.product?.title || "SHYN.ISH Jewellery Item",
          quantity: item.quantity,
          price: item.price
        }))
      }),

      // 3. WhatsApp / Webhook alert
      notifyAdminTransactionVerification({
        orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount,
        transactionId: razorpayPaymentId,
        paymentMethod: "RAZORPAY",
        verificationStatus: "SUCCESS",
      })
    ]).catch(err => console.error("[Razorpay Post-Processing Error]:", err));

    return {
      success: true,
      orderNumber,
      paymentId: razorpayPaymentId,
      status: "PAID",
    };
  } catch (error: any) {
    console.error("[verifyRazorpayPaymentAction] Error:", error);
    return { success: false, error: error.message || "Payment verification failed." };
  }
}
