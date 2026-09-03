"use server";

import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { recordOrderAttributionAndCommission } from "@/lib/attribution";

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      if (status === "PAID") {
        await tx.paymentAttempt.updateMany({
          where: { orderId },
          data: { status: "PAID", verificationStatus: "SUCCESS", verifiedAt: new Date() },
        });
      } else if (status === "CANCELLED") {
        await tx.paymentAttempt.updateMany({
          where: { orderId },
          data: { status: "FAILED", verificationStatus: "FAILED" },
        });
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return { success: false, error: error.message || "Failed to update order status" };
  }
}

export async function verifyAdminPaymentAction(
  orderId: string, 
  decision: "CONFIRM_PAID" | "REJECT_FAILED" | "RESET_PENDING"
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { paymentAttempts: true },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (decision === "CONFIRM_PAID") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        }),
        prisma.paymentAttempt.updateMany({
          where: { orderId },
          data: {
            status: "PAID",
            verificationStatus: "ADMIN_VERIFIED",
            verifiedAt: new Date(),
          },
        }),
      ]);

      // Credit influencer commission and update dashboard metrics
      await recordOrderAttributionAndCommission(order.orderNumber);
    } else if (decision === "REJECT_FAILED") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        }),
        prisma.paymentAttempt.updateMany({
          where: { orderId },
          data: {
            status: "FAILED",
            verificationStatus: "ADMIN_REJECTED",
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: "PENDING" },
        }),
        prisma.paymentAttempt.updateMany({
          where: { orderId },
          data: {
            status: "PENDING",
            verificationStatus: "PENDING",
          },
        }),
      ]);
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to verify transaction:", error);
    return { success: false, error: error.message || "Verification action failed" };
  }
}

export async function deleteOrderAction(orderId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.paymentAttempt.deleteMany({ where: { orderId } });
      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.order.delete({ where: { id: orderId } });
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete order:", error);
    return { success: false, error: error.message || "Failed to delete order" };
  }
}

export async function updateOrderDetailsAction(
  orderId: string, 
  data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    courierName?: string;
    trackingNumber?: string;
    adminNotes?: string;
    status?: OrderStatus;
    transactionId?: string;
  }
) {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return { success: false, error: "Order not found" };
    }

    const currentShipping: any = existingOrder.shippingAddress || {};

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || existingOrder.customerEmail,
          ...(data.status ? { status: data.status } : {}),
          ...(data.transactionId ? { paymentId: data.transactionId } : {}),
          shippingAddress: {
            ...currentShipping,
            address: data.address,
            city: data.city,
            state: data.state,
            pinCode: data.pinCode,
            courierName: data.courierName || currentShipping.courierName,
            trackingNumber: data.trackingNumber || currentShipping.trackingNumber,
            adminNotes: data.adminNotes || currentShipping.adminNotes,
          },
        },
      });

      if (data.transactionId) {
        await tx.paymentAttempt.updateMany({
          where: { orderId },
          data: { transactionId: data.transactionId },
        });
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update order details:", error);
    return { success: false, error: error.message || "Failed to update order details" };
  }
}
