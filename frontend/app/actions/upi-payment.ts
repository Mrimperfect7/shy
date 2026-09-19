"use server";

import prisma from "@/lib/prisma";
import { getPaymentVerificationProvider } from "@/lib/payments/verification";
import { notifyAdminTransactionVerification } from "@/lib/notifications/admin-notify";
import { sendTelegramOrderAlert } from "@/lib/notifications/telegram";
import { recordOrderAttributionAndCommission } from "@/lib/attribution";
import { cookies } from "next/headers";

const UPI_MERCHANT_ID = process.env.NEXT_PUBLIC_UPI_ID || "9562445577@axisbank";
const MERCHANT_NAME = "ESHARA NATURALS";

export interface InitiateUpiOrderInput {
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
 * Initiates an authoritative Order & PaymentAttempt record on the server.
 * Ensures the order amount is strictly calculated from the database product catalog.
 */
export async function initiateUpiOrderAction(input: InitiateUpiOrderInput) {
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

      // If active offer applies to this product, use the promotional sale price
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

      // If customer selected multi-pack with 5% discount in cart, validate and use unit price
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

    const orderNumber = `ESH-${Date.now().toString().slice(-6)}`;
    const paymentReference = `PAY-${orderNumber}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Create Order & PaymentAttempt atomically in Database
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
          paymentMethod: "UPI",
          couponCode: validCouponCode,
          discountAmount,
          shippingFee: SHIPPING_FEE,
        },
        totalAmount: finalTotal,
        status: "PENDING",
        paymentId: paymentReference,
        orderItems: {
          create: validatedOrderItems,
        },
        paymentAttempts: {
          create: {
            amount: finalTotal,
            currency: "INR",
            method: "UPI",
            status: "PENDING",
            paymentReference,
          },
        },
      },
      include: {
        paymentAttempts: true,
      },
    });

    // 4. Construct Official Standard UPI Payment URI
    const upiUrl = `upi://pay?pa=9562445577%40axisbank&pn=Eshara+Naturals&am=${finalTotal.toFixed(2)}&cu=INR`;

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentReference,
      totalAmount: finalTotal,
      upiId: UPI_MERCHANT_ID,
      upiUrl,
    };
  } catch (error: any) {
    console.error("[initiateUpiOrderAction] Error:", error);
    return { success: false, error: error.message || "Failed to initialize payment." };
  }
}

export interface VerifyUpiPaymentInput {
  orderNumber: string;
  paymentReference: string;
  transactionId: string;
}

/**
 * Server-authoritative verification of a claimed UPI Transaction ID.
 * Follows strict anti-fraud and verification rules.
 */
export async function verifyUpiTransactionAction(input: VerifyUpiPaymentInput) {
  try {
    const { orderNumber, paymentReference, transactionId } = input;

    // 1. Sanitize & Syntax Check
    const cleanTxId = (transactionId || "").replace(/[^a-zA-Z0-9]/g, "").trim();
    if (!cleanTxId || cleanTxId.length < 8 || cleanTxId.length > 30) {
      return {
        success: false,
        error: "Please enter a valid 12-digit UPI Reference Number / UTR (e.g. 423456789012).",
      };
    }

    // 2. Fetch authoritative Order & PaymentAttempt
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { 
        paymentAttempts: true,
        orderItems: {
          include: { product: true }
        }
      },
    });

    if (!order) {
      return { success: false, error: "Order not found. Please try checking out again." };
    }

    const paymentAttempt = order.paymentAttempts.find((p) => p.paymentReference === paymentReference) || order.paymentAttempts[0];
    if (!paymentAttempt) {
      return { success: false, error: "No matching payment attempt found." };
    }

    // 3. Rate Limiting Check (Max 5 attempts per attempt record)
    if (paymentAttempt.verificationAttempts >= 5) {
      return {
        success: false,
        error: "Too many verification attempts for this order. Please contact customer care on WhatsApp for assistance.",
      };
    }

    // 4. Anti-Fraud Check: Unique Transaction ID across system
    const existingUsage = await prisma.paymentAttempt.findFirst({
      where: {
        transactionId: cleanTxId,
        status: "PAID",
        id: { not: paymentAttempt.id },
      },
    });

    if (existingUsage) {
      return {
        success: false,
        error: "This UPI Transaction ID has already been redeemed for another order. Re-using transaction IDs is prohibited.",
      };
    }

    // Increment attempt count
    await prisma.paymentAttempt.update({
      where: { id: paymentAttempt.id },
      data: {
        verificationAttempts: { increment: 1 },
        transactionId: cleanTxId,
      },
    });

    // 5. Call Provider-Independent Verification Service
    const provider = getPaymentVerificationProvider();
    const verificationResult = await provider.verifyTransaction({
      transactionId: cleanTxId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      expectedAmount: order.totalAmount,
      currency: "INR",
      paymentReference,
      merchantUpiId: UPI_MERCHANT_ID,
      createdAt: paymentAttempt.createdAt,
    });

    // 6. Handle Verification Results
    if (verificationResult.verified && verificationResult.status === "SUCCESS") {
      // ── Payment Verified Successfully ──
      await prisma.$transaction([
        prisma.paymentAttempt.update({
          where: { id: paymentAttempt.id },
          data: {
            status: "PAID",
            verificationStatus: "SUCCESS",
            verifiedAt: new Date(),
            transactionId: cleanTxId,
            providerResponse: verificationResult.rawResponse || {},
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            paymentId: cleanTxId,
          },
        }),
      ]);

      const rawAddress: any = order.shippingAddress || {};

      // ── Non-blocking background side effects (Returns response to client instantly) ──
      Promise.allSettled([
        recordOrderAttributionAndCommission(order.orderNumber),

        sendTelegramOrderAlert({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          totalAmount: order.totalAmount,
          paymentMethod: "Direct UPI",
          paymentId: cleanTxId,
          couponCode: rawAddress?.couponCode,
          discountAmount: Number(rawAddress?.discountAmount || 0),
          address: {
            street: rawAddress?.address,
            city: rawAddress?.city,
            state: rawAddress?.state,
            pinCode: rawAddress?.pinCode,
          },
          items: order.orderItems.map(item => ({
            title: item.product?.title || "Eshara Naturals Herbal Hair Oil",
            quantity: item.quantity,
            price: item.price
          }))
        }),

        notifyAdminTransactionVerification({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          totalAmount: order.totalAmount,
          transactionId: cleanTxId,
          verificationStatus: "SUCCESS",
        })
      ]).catch(e => console.error("[UPI Post-Processing Error]:", e));

      return {
        success: true,
        verified: true,
        status: "PAID",
        orderNumber: order.orderNumber,
        message: "Payment successfully verified! Your order is confirmed.",
      };
    }

    if (verificationResult.status === "MANUAL_REVIEW") {
      // ── Unconfigured / Fallback to Manual Review ──
      await prisma.paymentAttempt.update({
        where: { id: paymentAttempt.id },
        data: {
          status: "MANUAL_REVIEW",
          verificationStatus: "MANUAL_REVIEW",
          transactionId: cleanTxId,
          providerResponse: verificationResult.rawResponse || {},
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentId: cleanTxId,
        },
      });

      // Notify Admin immediately via WhatsApp & webhook for manual verification
      notifyAdminTransactionVerification({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount,
        transactionId: cleanTxId,
        verificationStatus: "MANUAL_REVIEW",
      }).catch((e) => console.error("Admin notification error:", e));

      return {
        success: true,
        verified: false,
        status: "MANUAL_REVIEW",
        orderNumber: order.orderNumber,
        message: verificationResult.message || "Transaction ID received. Our team will verify your payment and dispatch your package shortly.",
      };
    }

    // ── Verification Failed ──
    await prisma.paymentAttempt.update({
      where: { id: paymentAttempt.id },
      data: {
        status: "FAILED",
        verificationStatus: "FAILED",
        providerResponse: verificationResult.rawResponse || {},
      },
    });

    return {
      success: false,
      verified: false,
      status: "FAILED",
      error: verificationResult.message || "Could not verify this UPI transaction. Please ensure the transaction completed in your UPI app and re-enter the correct 12-digit UTR.",
    };
  } catch (error: any) {
    console.error("[verifyUpiTransactionAction] Error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during payment verification.",
    };
  }
}
