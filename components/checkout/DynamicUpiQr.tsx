"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { 
  QrCode, 
  Copy, 
  Check, 
  Smartphone, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  X,
  ExternalLink
} from "lucide-react";
import { verifyUpiTransactionAction } from "@/app/actions/upi-payment";

interface DynamicUpiQrProps {
  orderNumber: string;
  paymentReference: string;
  amount: number;
  upiId: string;
  upiUrl: string;
  onSuccess: (orderNumber: string, status: string) => void;
  onCancel?: () => void;
}

type PaymentStep = "SCAN_AND_PAY" | "ENTER_UTR" | "VERIFYING" | "RESULT_SUCCESS" | "RESULT_MANUAL_REVIEW" | "RESULT_FAILED";

export default function DynamicUpiQr({
  orderNumber,
  paymentReference,
  amount,
  upiId,
  upiUrl,
  onSuccess,
  onCancel,
}: DynamicUpiQrProps) {
  const [step, setStep] = useState<PaymentStep>("SCAN_AND_PAY");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const merchantPhone = "9562445577";
  const formattedAmount = amount.toFixed(2);

  // Exact UPI Deep Link
  const singleUpiDeepLink = `upi://pay?pa=9562445577%40axisbank&pn=Eshara+Naturals&am=${formattedAmount}&cu=INR`;

  // Generate QR Code dynamically from authoritative UPI URL
  useEffect(() => {
    const targetUrl = upiUrl || singleUpiDeepLink;
    QRCode.toDataURL(targetUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: "#0A2612",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Generation failed", err));
  }, [upiUrl, singleUpiDeepLink]);

  const copyUpiId = () => {
    navigator.clipboard.writeText("9562445577@axisbank");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const copyMerchantPhone = () => {
    navigator.clipboard.writeText(merchantPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleLaunchUpi = () => {
    if (typeof window !== "undefined") {
      window.location.href = singleUpiDeepLink;
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setErrorMsg("Please enter your 12-digit UPI Reference Number / UTR.");
      return;
    }

    setErrorMsg("");
    setStep("VERIFYING");

    try {
      const res = await verifyUpiTransactionAction({
        orderNumber,
        paymentReference,
        transactionId: transactionId.trim(),
      });

      if (res.success) {
        if (res.status === "PAID") {
          setStep("RESULT_SUCCESS");
          setResultMessage(res.message || "Payment verified successfully!");
          setTimeout(() => {
            onSuccess(orderNumber, "PAID");
          }, 1500);
        } else if (res.status === "MANUAL_REVIEW") {
          setStep("RESULT_MANUAL_REVIEW");
          setResultMessage(res.message || "Your transaction ID has been recorded. Our team will verify and confirm your order.");
          setTimeout(() => {
            onSuccess(orderNumber, "MANUAL_REVIEW");
          }, 2000);
        }
      } else {
        setStep("RESULT_FAILED");
        setErrorMsg(res.error || "Payment verification could not be completed.");
      }
    } catch (err: any) {
      setStep("RESULT_FAILED");
      setErrorMsg(err.message || "An unexpected network error occurred.");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-2xl overflow-hidden max-w-md w-full mx-auto animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="px-6 py-4.5 border-b border-[#F0EBE1] bg-[#FAF8F5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0A2612]/10 text-[#0A2612] flex items-center justify-center">
            <Smartphone size={18} />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-[#1A1A1A]">Direct UPI Payment</h3>
            <p className="font-sans text-[11px] text-[#7A7A7A]">Order #{orderNumber}</p>
          </div>
        </div>

        {onCancel && step !== "VERIFYING" && (
          <button
            type="button"
            onClick={onCancel}
            className="w-7 h-7 rounded-full bg-[#EAE5DC]/60 hover:bg-[#EAE5DC] text-[#666] flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="p-6">
        
        {/* ── STEP 1: Scan & Pay ── */}
        {step === "SCAN_AND_PAY" && (
          <div className="space-y-4 text-center">
            
            {/* Amount Banner */}
            <div className="bg-[#FAF8F5] border border-[#ECE6DC] rounded-2xl p-3.5 flex items-center justify-between">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#6B7280]">Payable Amount</span>
              <span className="font-serif font-bold text-2xl text-[#0A2612]">₹{amount}</span>
            </div>

            {/* Single 1-Tap UPI Deep Link Button */}
            <div>
              <a
                href={singleUpiDeepLink}
                onClick={handleLaunchUpi}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-[#0A2612] hover:bg-[#133E20] text-white font-sans font-bold text-sm shadow-lg hover:shadow-xl active:scale-98 transition-all cursor-pointer group"
              >
                <Smartphone size={18} />
                <span>Pay ₹{amount} via UPI App</span>
                <ExternalLink size={15} className="text-white/70 group-hover:text-white transition-colors" />
              </a>
              <p className="text-[11px] font-sans text-gray-500 mt-1.5">
                Tap above to open your default UPI app directly
              </p>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="w-full border-t border-[#EAE5DC]" />
              <span className="absolute bg-white px-3 font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Or Scan QR Code
              </span>
            </div>

            {/* Official Merchant QR Code Card */}
            <div className="relative inline-block p-3.5 rounded-2xl bg-white border border-[#E0DACF] shadow-sm">
              <img 
                src="/assets/upi-qr.png" 
                alt="Official Eshara Naturals UPI Payment QR Code" 
                className="w-48 h-auto mx-auto object-contain rounded-xl"
              />

              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-sans font-medium text-[#16A34A]">
                <ShieldCheck size={14} />
                <span>Scan with Camera · Exact ₹{amount}</span>
              </div>
            </div>

            {/* Direct UPI ID & Mobile Number Copy Boxes */}
            <div className="space-y-1.5">
              {/* UPI ID */}
              <div className="bg-[#FAF8F5] border border-[#E8E3DA] rounded-xl p-2.5 flex items-center justify-between text-xs font-sans">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-[#8E8E8E] block">UPI ID (VPA)</span>
                  <span className="font-mono font-bold text-[#1A1A1A]">9562445577@axisbank</span>
                </div>
                <button
                  type="button"
                  onClick={copyUpiId}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#D5CEC2] hover:bg-[#F0EBE1] text-[#0A2612] font-semibold text-xs transition-colors cursor-pointer"
                >
                  {copiedUpi ? <Check size={13} className="text-[#16A34A]" /> : <Copy size={13} />}
                  <span>{copiedUpi ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Mobile Number */}
              <div className="bg-[#FAF8F5] border border-[#E8E3DA] rounded-xl p-2.5 flex items-center justify-between text-xs font-sans">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-[#8E8E8E] block">Mobile Number (PhonePe / GPay)</span>
                  <span className="font-mono font-bold text-[#1A1A1A]">{merchantPhone}</span>
                </div>
                <button
                  type="button"
                  onClick={copyMerchantPhone}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#D5CEC2] hover:bg-[#F0EBE1] text-[#0A2612] font-semibold text-xs transition-colors cursor-pointer"
                >
                  {copiedPhone ? <Check size={13} className="text-[#16A34A]" /> : <Copy size={13} />}
                  <span>{copiedPhone ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Next Step Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep("ENTER_UTR")}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-sans font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>I&apos;ve Paid — Enter Transaction ID</span>
                <ArrowRight size={16} />
              </button>
              <p className="text-[11px] font-sans text-[#8E8E8E] mt-2">
                After completing payment, click above to enter your 12-digit UTR
              </p>
            </div>

          </div>
        )}

        {/* ── STEP 2: Enter Transaction ID / UTR ── */}
        {step === "ENTER_UTR" && (
          <form onSubmit={handleVerify} className="space-y-4">
            
            <div className="text-center">
              <div className="w-11 h-11 rounded-full bg-[#EBF5ED] text-[#16A34A] flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-serif text-lg font-medium text-[#1A1A1A]">Enter UPI Transaction ID (UTR)</h4>
              <p className="font-sans text-xs text-[#7A7A7A] mt-0.5">
                Enter the 12-digit reference number from your UPI payment receipt.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#DC2626] font-sans flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#4A4A4A] mb-1.5">
                12-Digit UPI Ref / UTR Number <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 22))}
                placeholder="e.g. 423456789012"
                maxLength={22}
                required
                className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CA] focus:border-[#0A2612] focus:bg-white focus:ring-2 focus:ring-[#0A2612]/10 rounded-xl text-sm font-mono tracking-widest text-center uppercase outline-none transition-all"
                autoFocus
              />
            </div>

            {/* Help Dropdown Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowUtrHelp(!showUtrHelp)}
                className="text-xs font-sans text-[#0A2612] hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
              >
                <HelpCircle size={13} />
                <span>Where do I find the UTR / Ref No?</span>
              </button>

              {showUtrHelp && (
                <div className="mt-2 p-3 bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl text-[11px] font-sans text-[#555] space-y-1.5 animate-in fade-in">
                  <p>• <strong>Google Pay:</strong> Open payment receipt → look for &quot;UPI transaction ID&quot; (12 digits).</p>
                  <p>• <strong>PhonePe:</strong> View transaction details → look for &quot;UTR&quot; / &quot;Transaction ID&quot;.</p>
                  <p>• <strong>Paytm:</strong> Open order details → check &quot;UPI Ref No&quot;.</p>
                  <p>• <strong>BHIM / Other:</strong> Look for &quot;Bank Reference No / UTR&quot;.</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#0A2612] hover:bg-[#133E20] text-white font-sans font-semibold text-sm shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <span>Submit &amp; Verify Payment</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => setStep("SCAN_AND_PAY")}
                className="w-full py-2.5 text-xs font-sans text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors cursor-pointer"
              >
                ← Back to Payment Options
              </button>
            </div>

          </form>
        )}

        {/* ── STEP 3: Verifying In Progress ── */}
        {step === "VERIFYING" && (
          <div className="py-8 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#0A2612]/15 animate-ping" />
              <Loader2 className="animate-spin text-[#0A2612]" size={36} />
            </div>

            <div>
              <h4 className="font-serif text-lg font-semibold text-[#1A1A1A]">Verifying Your Payment…</h4>
              <p className="font-sans text-xs text-[#7A7A7A] mt-1 max-w-xs mx-auto leading-relaxed">
                Checking transaction <span className="font-mono font-bold text-[#1A1A1A]">{transactionId}</span> against authorized payment verification services.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 4A: Result - Success ── */}
        {step === "RESULT_SUCCESS" && (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#EBF5ED] text-[#16A34A] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-serif text-xl font-bold text-[#1A1A1A]">Payment Verified ✓</h4>
            <p className="font-sans text-xs text-[#16A34A] font-medium">{resultMessage}</p>
            <p className="font-sans text-[11px] text-[#7A7A7A]">Redirecting you to your order confirmation…</p>
          </div>
        )}

        {/* ── STEP 4B: Result - Manual Review / Recorded ── */}
        {step === "RESULT_MANUAL_REVIEW" && (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck size={32} />
            </div>
            <h4 className="font-serif text-xl font-bold text-[#1A1A1A]">Transaction Recorded</h4>
            <p className="font-sans text-xs text-[#92400E] leading-relaxed max-w-xs mx-auto">{resultMessage}</p>
            <p className="font-sans text-[11px] text-[#7A7A7A]">Redirecting to order receipt…</p>
          </div>
        )}

        {/* ── STEP 4C: Result - Failed ── */}
        {step === "RESULT_FAILED" && (
          <div className="py-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto">
              <AlertCircle size={26} />
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">Verification Unsuccessful</h4>
              <p className="font-sans text-xs text-[#DC2626] mt-1 leading-relaxed max-w-xs mx-auto">
                {errorMsg}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep("ENTER_UTR")}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0A2612] text-white font-sans font-semibold text-xs shadow-sm hover:bg-[#133E20] cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Re-enter Transaction ID</span>
              </button>

              <button
                type="button"
                onClick={() => setStep("SCAN_AND_PAY")}
                className="w-full py-2 text-xs font-sans text-[#7A7A7A] hover:text-[#1A1A1A] cursor-pointer"
              >
                ← View Payment Options Again
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
