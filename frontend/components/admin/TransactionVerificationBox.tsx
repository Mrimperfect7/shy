"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Copy, 
  Check, 
  Loader2, 
  ShieldCheck, 
  CreditCard,
  Smartphone
} from "lucide-react";
import { verifyAdminPaymentAction } from "@/app/actions/admin-orders";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";

interface TransactionVerificationBoxProps {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string | null;
  totalAmount: number;
  paymentId?: string | null;
  orderStatus: string;
  paymentMethod?: string | null;
  paymentAttempts?: Array<{
    id: string;
    transactionId?: string | null;
    method?: string | null;
    status: string;
    verificationStatus?: string | null;
    createdAt: string | Date;
  }>;
}

export default function TransactionVerificationBox({
  orderId,
  orderNumber,
  customerName,
  customerPhone,
  totalAmount,
  paymentId,
  orderStatus,
  paymentMethod,
  paymentAttempts = [],
}: TransactionVerificationBoxProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const latestAttempt = paymentAttempts[0];
  const txId = paymentId || latestAttempt?.transactionId || "";
  const isPaid = orderStatus === "PAID" || orderStatus === "SHIPPED" || orderStatus === "DELIVERED";
  const isPending = orderStatus === "PENDING";
  const isCancelled = orderStatus === "CANCELLED";

  const resolvedMethod = (
    paymentMethod || 
    latestAttempt?.method || 
    (txId.startsWith("pay_") ? "RAZORPAY" : "UPI")
  ).toUpperCase();

  const isRazorpay = resolvedMethod === "RAZORPAY" || txId.startsWith("pay_");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDecision = async (decision: "CONFIRM_PAID" | "REJECT_FAILED" | "RESET_PENDING") => {
    const confirmMsg = decision === "CONFIRM_PAID"
      ? `Verify & mark Order #${orderNumber} as PAID (₹${totalAmount})?`
      : decision === "REJECT_FAILED"
      ? `Reject payment and mark Order #${orderNumber} as CANCELLED?`
      : `Reset Order #${orderNumber} to PENDING verification?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    const res = await verifyAdminPaymentAction(orderId, decision);
    if (!res.success) {
      alert("Verification failed: " + res.error);
    }
    setLoading(false);
  };

  const cleanPhone = (customerPhone || "").replace(/\D/g, "");
  const waConfirmMsg = encodeURIComponent(
    `Hello ${customerName}! Your payment of ₹${totalAmount} (${isRazorpay ? "Razorpay ID" : "UPI Ref"}: ${txId || "Verified"}) for SHYN.ISH order #${orderNumber} has been verified and confirmed ✓. Your handcrafted package is now queued for dispatch.`
  );

  return (
    <div className={`p-3.5 rounded-xl border transition-all text-xs font-sans ${
      isPaid 
        ? "bg-emerald-50/70 border-emerald-200 text-emerald-950" 
        : isCancelled
        ? "bg-red-50/70 border-red-200 text-red-950"
        : "bg-amber-50/70 border-amber-200 text-amber-950"
    }`}>
      
      {/* Header: Title & Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-gray-700">
          {isRazorpay ? (
            <CreditCard size={13} className="text-blue-600" />
          ) : (
            <Smartphone size={13} className="text-purple-600" />
          )}
          <span>{isRazorpay ? "Razorpay Gateway" : "Direct UPI"}</span>
        </span>

        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase tracking-wider border ${
          isPaid
            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
            : isCancelled
            ? "bg-red-100 text-red-800 border-red-300"
            : "bg-amber-100 text-amber-900 border-amber-300"
        }`}>
          {isPaid ? "✓ Verified & Paid" : isCancelled ? "✕ Cancelled" : "⏳ Verification Pending"}
        </span>
      </div>

      {/* Transaction ID / Payment Reference Display */}
      <div className="bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs space-y-1.5 mb-2.5">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-[11px]">
            {isRazorpay ? "Payment ID:" : "UPI Ref / UTR:"}
          </span>
          {txId ? (
            <div className="flex items-center gap-1">
              <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[11px] select-all">
                {txId}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(txId)}
                className="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                title="Copy Payment ID"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              </button>
            </div>
          ) : (
            <span className="text-gray-400 italic text-[11px]">Pending capture</span>
          )}
        </div>

        {latestAttempt?.verificationStatus && (
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-gray-100 text-gray-500">
            <span>Provider Status:</span>
            <span className="font-mono font-medium text-emerald-700">{latestAttempt.verificationStatus}</span>
          </div>
        )}
      </div>

      {/* Verification Actions */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {!isPaid && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDecision("CONFIRM_PAID")}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            <span>Mark as Paid</span>
          </button>
        )}

        {isPaid && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDecision("RESET_PENDING")}
            className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
            <span>Reset to Pending</span>
          </button>
        )}

        {!isCancelled && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDecision("REJECT_FAILED")}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
            title="Reject Payment"
          >
            <XCircle size={12} />
            <span>Reject</span>
          </button>
        )}

        {cleanPhone && (
          <a
            href={`https://wa.me/91${cleanPhone.slice(-10)}?text=${waConfirmMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-[11px] transition-colors shadow-2xs cursor-pointer"
            title="Send WhatsApp Confirmation"
          >
            <WhatsAppIcon size={12} fill="#ffffff" />
            <span>WA</span>
          </a>
        )}
      </div>

    </div>
  );
}
