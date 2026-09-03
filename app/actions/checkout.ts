"use server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function createOrderAction(formData: FormData) {
  try {
    const customerName = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const pinCode = formData.get("pinCode") as string;
    const itemsJson = formData.get("items") as string;
    const totalAmountStr = formData.get("totalAmount") as string;
    const paymentMethod = (formData.get("paymentMethod") as string) || "PREPAID";
    const upfrontAmountStr = (formData.get("upfrontAmount") as string) || totalAmountStr;
    const couponCode = (formData.get("couponCode") as string) || null;

    if (!customerName || !phone || !address || !itemsJson || !totalAmountStr) {
      return { success: false, error: "Missing required fields" };
    }

    const items = JSON.parse(itemsJson);
    const totalAmount = parseFloat(totalAmountStr);

    const orderNumber = `ESH-${Date.now().toString().slice(-6)}`;

    // Optional payment screenshot uploaded during checkout
    const screenshotFile = formData.get("screenshot") as File | null;
    let screenshotUrl = "";
    if (screenshotFile && screenshotFile.size > 0) {
      try {
        const blob = await put(`screenshots/${Date.now()}-${screenshotFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`, screenshotFile, {
          access: "public",
        });
        screenshotUrl = blob.url;
      } catch (e) {
        console.warn("Vercel blob failed, fallback to base64", e);
        const arrayBuffer = await screenshotFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        screenshotUrl = `data:${screenshotFile.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
      }
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: { 
          address, 
          city, 
          state, 
          pinCode, 
          paymentMethod,
          ...(screenshotUrl ? { screenshotUrl } : {})
        },
        totalAmount,
        status: "PENDING",
        paymentId: screenshotUrl ? (screenshotUrl.startsWith("data:") ? "SCREENSHOT_ATTACHED" : screenshotUrl) : null,
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          }))
        }
      }
    });

    // Fire off WhatsApp notification in the background to admin (9048995577)
    const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER || "+919048995577";
    const apiKey = process.env.TEXTMEBOT_API_KEY || process.env.CALLMEBOT_API_KEY;

    if (adminNumber && apiKey) {
      const upfrontAmount = parseFloat(upfrontAmountStr);
      const paymentLabel = paymentMethod === "CARD" 
        ? "Debit / Credit Card (Paid to Account)" 
        : paymentMethod === "BANK" 
        ? "Direct Bank Transfer" 
        : paymentMethod === "COD" 
        ? "Cash on Delivery" 
        : "UPI Payment";

      let itemsSummary = "";
      items.forEach((item: any) => {
        itemsSummary += `%0A  - ${item.quantity}x ${item.title || "Product"} (₹${item.price * item.quantity})`;
      });

      const couponText = couponCode ? `%0A*Coupon Applied:* ${couponCode}` : "";
      const screenshotText = screenshotUrl && !screenshotUrl.startsWith("data:") ? `%0A*Payment Screenshot:* ${screenshotUrl}` : "";

      const message = `*New Order Placed!* %0A%0A*Order #:* ${orderNumber} %0A*Customer:* ${customerName} %0A*Phone:* ${phone} %0A*Delivery Address:* ${address}, ${city}, ${state} - ${pinCode} %0A%0A*Items:*${itemsSummary} ${couponText} ${screenshotText} %0A%0A*Total Order Value:* ₹${totalAmount} %0A*Payment Method:* ${paymentLabel} (₹${upfrontAmount}) %0A*Status:* Recorded in Dashboard.`;
      
      const url = `http://api.textmebot.com/send.php?recipient=${adminNumber}&apikey=${apiKey}&text=${message}`;
      
      // We don't await this so it doesn't block checkout
      fetch(url).catch(e => console.error("WhatsApp notification failed:", e));
    }

    // Process Referral
    try {
      const cookieStore = await cookies();
      const referralCode = cookieStore.get("eshara_referral")?.value;

      if (referralCode) {
        const referrer = await prisma.customerReferralProfile.findUnique({
          where: { referralCode }
        });

        if (referrer && referrer.email !== email.toLowerCase()) {
          // Increment successful referrals
          const updatedReferrer = await prisma.customerReferralProfile.update({
            where: { id: referrer.id },
            data: { successfulReferrals: { increment: 1 } },
            include: { rewards: true }
          });

          // Check if milestone hit to award a coupon
          const settings = await prisma.referralSettings.findUnique({ where: { id: "singleton" } });
          const milestones = Array.isArray(settings?.milestones) ? settings.milestones as any[] : [
            { count: 1, discountValue: 5, discountType: 'PERCENTAGE' },
            { count: 3, discountValue: 10, discountType: 'PERCENTAGE' },
            { count: 5, discountValue: 20, discountType: 'PERCENTAGE' }
          ];

          const hitMilestone = milestones.find(m => m.count === updatedReferrer.successfulReferrals);

          if (hitMilestone) {
            const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const couponCode = `REF-${updatedReferrer.referralCode}-${randomCode}`;

            await prisma.referralReward.create({
              data: {
                profileId: updatedReferrer.id,
                discountType: hitMilestone.discountType,
                discountValue: hitMilestone.discountValue,
                couponCode: couponCode,
                milestone: hitMilestone.count,
                isRedeemed: false
              }
            });
          }
        }
      }
    } catch (err) {
      console.error("Referral tracking failed during checkout:", err);
    }

    // Process Coupon Usage & Influencer Attribution
    if (couponCode) {
      try {
        const normalizedCode = couponCode.trim().toUpperCase();
        const reward = await prisma.referralReward.findUnique({ where: { couponCode: normalizedCode } });
        
        if (reward && !reward.isRedeemed) {
          await prisma.referralReward.update({ 
            where: { id: reward.id }, 
            data: { isRedeemed: true } 
          });
        }
      } catch (err) {
        console.error("Failed to validate coupon on order creation:", err);
      }
    }

    return { success: true, orderId: order.id, orderNumber };
  } catch (error: any) {
    console.error("Order creation error:", error);
    return { success: false, error: error.message || "Failed to create order" };
  }
}

export async function validateCouponAction(code: string, cartTotal: number) {
  try {
    const codeUpper = code.toUpperCase();
    
    // Check Influencer/Admin Coupons
    const coupon = await prisma.coupon.findUnique({
      where: { code: codeUpper }
    });

    if (coupon) {
      if (coupon.status !== "ACTIVE") return { success: false, error: "Coupon is not active" };
      if (coupon.expiryDate && new Date() > coupon.expiryDate) return { success: false, error: "Coupon has expired" };
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { success: false, error: "Coupon usage limit reached" };
      if (coupon.minimumOrderValue && cartTotal < coupon.minimumOrderValue) return { success: false, error: `Minimum order value is ₹${coupon.minimumOrderValue}` };

      return { 
        success: true, 
        discountType: coupon.discountType, 
        discountValue: coupon.discountValue,
        maximumDiscount: coupon.maximumDiscount
      };
    }

    // Check Referral Rewards
    const reward = await prisma.referralReward.findUnique({
      where: { couponCode: codeUpper }
    });

    if (reward) {
      if (reward.isRedeemed) return { success: false, error: "This referral reward has already been used" };
      
      return {
        success: true,
        discountType: reward.discountType,
        discountValue: reward.discountValue,
        maximumDiscount: null
      };
    }

    return { success: false, error: "Invalid coupon code" };
  } catch (error: any) {
    console.error("Coupon validation error:", error);
    return { success: false, error: "Failed to validate coupon" };
  }
}

export async function uploadPaymentScreenshotAction(orderNumber: string, formData: FormData) {
  try {
    const file = formData.get("screenshot") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "No screenshot file provided" };
    }

    let screenshotUrl = "";
    try {
      const blob = await put(`screenshots/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`, file, {
        access: "public",
      });
      screenshotUrl = blob.url;
    } catch (e) {
      console.warn("Vercel blob failed, fallback to base64 data url", e);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      screenshotUrl = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber }
    });

    if (order) {
      const currentAddress: any = order.shippingAddress || {};
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentId: screenshotUrl.startsWith("data:") ? "SCREENSHOT_ATTACHED" : screenshotUrl,
          shippingAddress: {
            ...currentAddress,
            screenshotUrl
          }
        }
      });
      revalidatePath("/admin/orders");
      revalidatePath("/admin");
    }

    return { success: true, screenshotUrl };
  } catch (error: any) {
    console.error("Screenshot upload failed:", error);
    return { success: false, error: error.message || "Failed to upload screenshot" };
  }
}

/**
 * Lightweight screenshot upload for WhatsApp checkout flows.
 * Returns a public URL so it can be appended as a link in the WhatsApp message text.
 */
export async function uploadScreenshotForWhatsAppAction(formData: FormData) {
  try {
    const file = formData.get("screenshot") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "No screenshot file provided" };
    }

    let screenshotUrl = "";
    try {
      const blob = await put(
        `screenshots/wa-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
        file,
        { access: "public" }
      );
      screenshotUrl = blob.url;
    } catch (e) {
      console.warn("Vercel blob failed for WA upload, using base64 fallback", e);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      screenshotUrl = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
    }

    return { success: true, screenshotUrl };
  } catch (error: any) {
    console.error("WhatsApp screenshot upload failed:", error);
    return { success: false, error: error.message || "Failed to upload screenshot" };
  }
}
