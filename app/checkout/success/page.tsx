import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { 
  CheckCircle2, 
  ShoppingBag, 
  Package, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  MapPin,
  Check
} from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import PurchaseTracker from "@/components/marketing/PurchaseTracker";

export const dynamic = "force-dynamic";

const ADMIN_WA_NUMBER = "919876543210";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string; amount?: string; method?: string; status?: string }>;
}) {
  const params = await searchParams;
  const orderNumber = params.orderNumber;

  // 1. Authoritative Server-Side Query from Database
  let dbOrder = null;
  if (orderNumber) {
    dbOrder = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        paymentAttempts: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        orderItems: {
          include: { product: true },
        },
      },
    });
  }

  // 2. Authoritative Verification Status
  const isPaid = dbOrder?.status === "PAID";
  const latestAttempt = dbOrder?.paymentAttempts?.[0];
  const isManualReview = latestAttempt?.status === "MANUAL_REVIEW" || (!isPaid && dbOrder?.status === "PENDING");
  const displayAmount = dbOrder ? dbOrder.totalAmount : params.amount || "0";
  const shipping = (dbOrder?.shippingAddress as any) || {};

  // Build WhatsApp inquiry message for the customer
  const waMsg = encodeURIComponent(
    `Hello SHYN.ISH! I placed jewellery order #${orderNumber || "NEW"}. My payment status is: ${isPaid ? "PAID" : "PENDING"}. Please update me on the dispatch status.`
  );

  return (
    <div className="min-h-screen pt-8 pb-20 bg-[#FAF8F5] text-[#141312]">
      {isPaid && dbOrder && (
        <PurchaseTracker
          orderId={dbOrder.orderNumber}
          contentIds={dbOrder.orderItems.map((item: any) => item.productId)}
          value={dbOrder.totalAmount}
          numItems={dbOrder.orderItems.reduce((acc: number, item: any) => acc + item.quantity, 0)}
          currency="INR"
        />
      )}
      <div className="max-w-2xl mx-auto px-5 sm:px-6">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl tracking-[0.2em] font-medium text-[#141312]">
              SHYN<span className="text-[#C5A059]">.</span>ISH
            </span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#EAE5DC] p-6 sm:p-10 text-center space-y-6">
          
          {/* Status Icon */}
          <div className="w-18 h-18 rounded-full flex items-center justify-center mx-auto shadow-xs animate-in zoom-in-50 duration-300 bg-[#EBF5ED] text-[#16A34A]">
            {isPaid ? (
              <CheckCircle2 size={40} className="text-[#16A34A]" />
            ) : isManualReview ? (
              <Clock size={38} className="text-[#D97706]" />
            ) : (
              <AlertCircle size={38} className="text-[#DC2626]" />
            )}
          </div>

          {/* Title & Status Badge */}
          <div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-sans font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
              isPaid
                ? "text-[#166534] bg-[#EBF5ED] border-[#C6E6CB]"
                : "text-[#92400E] bg-[#FEF3C7] border-[#FDE68A]"
            }`}>
              {isPaid ? "✓ Payment Verified & Confirmed" : "⏳ Order Placed — Payment In Verification"}
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl mt-3.5 mb-2 text-[#1A1A1A] font-medium">
              {isPaid ? "Thank You for Your Order!" : "Order Successfully Placed"}
            </h1>

            <p className="font-sans text-xs sm:text-sm text-[#787878] max-w-md mx-auto leading-relaxed">
              {isPaid
                ? "Your direct UPI payment has been verified with the payment network. We are carefully packaging your fresh Ayurvedic blend."
                : "We have recorded your order and transaction details. Our verification desk will confirm your dispatch shortly."}
            </p>
          </div>

          {/* Receipt Info Box */}
          <div className="bg-[#FAF8F5] rounded-2xl p-5 sm:p-6 text-left space-y-3.5 border border-[#ECE6DC] text-xs sm:text-sm font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-[#EAE5DC]">
              <span className="text-[#787878]">Order Number:</span>
              <span className="font-mono font-bold text-[#1A1A1A]">{orderNumber || "ESH-PENDING"}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-[#EAE5DC]">
              <span className="text-[#787878]">Total Amount:</span>
              <span className="font-serif font-bold text-[#0A2612] text-base">₹{displayAmount}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-[#EAE5DC]">
              <span className="text-[#787878]">Payment Method:</span>
              <span className="font-semibold text-[#1A1A1A]">Direct UPI Payment</span>
            </div>

            {latestAttempt?.transactionId && (
              <div className="flex justify-between items-center pb-3 border-b border-[#EAE5DC]">
                <span className="text-[#787878]">Transaction UTR:</span>
                <span className="font-mono font-bold text-[#0A2612] bg-white px-2 py-0.5 rounded border border-[#E0DACF]">
                  {latestAttempt.transactionId}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-[#787878]">Dispatch Schedule:</span>
              <span className="text-[#166534] font-semibold flex items-center gap-1.5">
                <Package size={15} /> Handcrafted &amp; Dispatched within 24h
              </span>
            </div>
          </div>

          {/* Delivery Address Summary */}
          {shipping.address && (
            <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] text-left text-xs font-sans text-[#555] space-y-1">
              <div className="flex items-center gap-1.5 text-[#0A2612] font-bold uppercase tracking-wider text-[11px] mb-1">
                <MapPin size={13} />
                <span>Shipping Address</span>
              </div>
              <p className="font-semibold text-[#1A1A1A]">{dbOrder?.customerName} • {dbOrder?.customerPhone}</p>
              <p>{shipping.address}, {shipping.city}, {shipping.state} - {shipping.pinCode}</p>
            </div>
          )}

          {/* WhatsApp Connect Action */}
          <div className="p-4 rounded-2xl bg-[#EBF5ED] border border-[#C6E6CB] text-left flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-sans font-bold text-xs text-[#14532D]">Need Help or Instant Updates?</p>
              <p className="font-sans text-[11px] text-[#166534] mt-0.5">
                Connect directly with our Kerala team on WhatsApp with your Order ID.
              </p>
            </div>
            <a
              href={`https://wa.me/${ADMIN_WA_NUMBER}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-sans font-semibold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <WhatsAppIcon size={15} fill="#ffffff" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Continue Shopping Button */}
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-sans text-xs font-semibold bg-[#0A2612] hover:bg-[#133E20] text-white transition-colors shadow-md"
            >
              <ShoppingBag size={16} /> Continue Shopping
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-sans text-[#8E8E8E] pt-2">
            <ShieldCheck size={14} className="text-[#16A34A]" />
            <span>100% Authentic Handcrafted Formulation · Kerala, India</span>
          </div>

        </div>
      </div>
    </div>
  );
}
