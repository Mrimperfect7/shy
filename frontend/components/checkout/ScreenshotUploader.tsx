"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  X, 
  FileCheck2 
} from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import { uploadPaymentScreenshotAction } from "@/app/actions/checkout";

export default function ScreenshotUploader({
  orderNumber,
  amount
}: {
  orderNumber: string;
  amount?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const localUrl = URL.createObjectURL(selected);
    setPreviewUrl(localUrl);
    setUploadSuccess(false);

    // Automatically upload to server
    setUploading(true);
    const formData = new FormData();
    formData.append("screenshot", selected);

    const res = await uploadPaymentScreenshotAction(orderNumber, formData);
    if (res.success && res.screenshotUrl) {
      setUploadedUrl(res.screenshotUrl);
      setUploadSuccess(true);
    }
    setUploading(false);
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadedUrl(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendToWhatsApp = async () => {
    // If no file uploaded yet, prompt file selector first
    if (!file && !uploadedUrl) {
      fileInputRef.current?.click();
      return;
    }

    const priceText = amount ? ` for ₹${amount}` : "";
    let messageText = `Hi SHYN.ISH! I have placed order *${orderNumber}*${priceText}.\nAttached is my payment confirmation screenshot.`;

    if (uploadedUrl && !uploadedUrl.startsWith("data:")) {
      messageText += `\n\nPayment Receipt Link: ${uploadedUrl}`;
    }

    // Direct redirect to Admin WhatsApp chat (+91 9048995577)
    const encoded = encodeURIComponent(messageText);
    window.open(`https://wa.me/919048995577?text=${encoded}`, "_blank");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm space-y-4 text-left">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
            <Camera size={20} className="text-forest" />
            Upload Payment Screenshot
          </h3>
          <p className="text-xs text-gray-500 font-sans mt-0.5">
            Attach screenshot from GPay, PhonePe, Paytm, or your banking app.
          </p>
        </div>

        {uploadSuccess && (
          <span className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={13} /> Saved to Order
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Upload Drop Zone / Selector */}
      {!previewUrl ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 hover:border-forest/70 hover:bg-forest/5 rounded-xl p-6 transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload size={22} />
          </div>
          <div>
            <span className="font-sans text-xs sm:text-sm font-semibold text-gray-800 block">
              Tap here to Choose or Take Screenshot
            </span>
            <span className="font-sans text-[11px] text-gray-400 block mt-0.5">
              JPG, PNG, WebP or mobile screenshots supported
            </span>
          </div>
        </button>
      ) : (
        <div className="relative bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0">
            <Image
              src={previewUrl}
              alt="Payment Screenshot"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <FileCheck2 size={15} className="text-forest" />
              <p className="font-sans text-xs font-bold text-gray-900 truncate">
                {file?.name || "Payment_Screenshot.jpg"}
              </p>
            </div>
            <p className="font-sans text-[11px] text-gray-500 mt-0.5">
              {file ? `${(file.size / 1024).toFixed(0)} KB · ` : ""}
              {uploading ? (
                <span className="text-amber-600 inline-flex items-center gap-1">
                  <Loader2 size={11} className="animate-spin" /> Uploading…
                </span>
              ) : uploadSuccess ? (
                <span className="text-emerald-700 font-medium">Ready to send</span>
              ) : (
                <span>Selected</span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
            title="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main WhatsApp Action Button */}
      <button
        type="button"
        onClick={handleSendToWhatsApp}
        className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-sans text-sm font-semibold bg-[#25D366] hover:bg-[#1DA851] text-white transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
      >
        <WhatsAppIcon size={19} fill="#ffffff" />
        <span>{file ? "Send Screenshot on WhatsApp" : "Send Order Details on WhatsApp"}</span>
      </button>

      <p className="text-center text-[11px] font-sans text-gray-400">
        💡 Our customer support team will verify your screenshot and share your tracking link.
      </p>
    </div>
  );
}
