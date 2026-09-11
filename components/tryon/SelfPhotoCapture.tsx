"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, Camera, RefreshCw, Sparkles, Shield, AlertCircle, CheckCircle2, X } from "lucide-react";
import { compressAndFormatImage, validateImageFile } from "@/lib/tryon/client-image";
import { JewelryCategory } from "@/lib/tryon/types";

interface SelfPhotoCaptureProps {
  category: JewelryCategory;
  onPhotoReady: (base64Image: string) => void;
  disabled?: boolean;
}

export default function SelfPhotoCapture({
  category,
  onPhotoReady,
  disabled = false,
}: SelfPhotoCaptureProps) {
  const [subMode, setSubMode] = useState<"upload" | "camera">("upload");
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Category specific guidance
  const getCategoryGuidance = () => {
    switch (category) {
      case "earrings":
        return "For best results, tuck hair behind one or both ears and face forward.";
      case "necklaces":
      case "chains":
      case "pendants":
        return "Keep your neck and collarbone visible with plain or open-neck clothing.";
      case "rings":
        return "Rest your hand flat against a neutral surface with fingers naturally relaxed.";
      case "bracelets":
        return "Show your wrist resting against a neutral background.";
      default:
        return "Use a clear, front-facing, well-lit photo.";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Invalid file format");
      return;
    }

    try {
      setIsProcessing(true);
      const processed = await compressAndFormatImage(file, 1280, 0.88);
      setPreviewDataUrl(processed.dataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process selected image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    setErrorMessage(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setHasCameraPermission(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setHasCameraPermission(false);
      setErrorMessage("Could not access camera. Please allow camera permissions or upload a photo.");
      setSubMode("upload");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(nextFacing);
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 1000;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Mirror if front camera for natural selfie view
      if (cameraFacing === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setPreviewDataUrl(dataUrl);
      stopCamera();
    }
  };

  const handleReset = () => {
    setPreviewDataUrl(null);
    setErrorMessage(null);
    if (subMode === "camera") {
      startCamera();
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#C5A059]/20 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059]">
            Step 1 · Your Photograph
          </p>
          <h3 className="font-serif text-lg sm:text-xl text-[#141312]">
            Upload a photo or capture a live selfie
          </h3>
        </div>

        {/* Submode Switcher */}
        {!previewDataUrl && (
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-full border border-[#C5A059]/25 text-xs font-sans">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setSubMode("upload");
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-medium flex items-center gap-1.5 ${
                subMode === "upload"
                  ? "bg-[#141312] text-[#FAF8F5] shadow-xs"
                  : "text-[#5E564F] hover:text-[#141312]"
              }`}
            >
              <Upload size={13} />
              <span>Upload Photo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSubMode("camera");
                startCamera();
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-medium flex items-center gap-1.5 ${
                subMode === "camera"
                  ? "bg-[#141312] text-[#FAF8F5] shadow-xs"
                  : "text-[#5E564F] hover:text-[#141312]"
              }`}
            >
              <Camera size={13} />
              <span>Take Selfie</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans flex items-center gap-2">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ─── PREVIEW STATE (Photo Uploaded or Captured) ─── */}
      {previewDataUrl ? (
        <div className="flex flex-col items-center space-y-5">
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#C5A059] shadow-xl bg-black">
            <Image
              src={previewDataUrl}
              alt="Your Photo Preview"
              fill
              sizes="(max-width: 640px) 100vw, 384px"
              className="object-contain"
            />
            <button
              type="button"
              onClick={handleReset}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 backdrop-blur-xs text-white hover:bg-black transition-colors"
              title="Retake photo"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <button
              type="button"
              onClick={handleReset}
              className="btn-outline px-5 py-3 text-xs flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Change Photo</span>
            </button>
            <button
              type="button"
              onClick={() => onPhotoReady(previewDataUrl)}
              disabled={disabled || isProcessing}
              className="btn-gold px-8 py-3 text-xs font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Sparkles size={14} />
              <span>Generate Virtual Try-On</span>
            </button>
          </div>
        </div>
      ) : (
        /* ─── CAPTURE / UPLOAD STATE ─── */
        <div>
          {subMode === "upload" ? (
            /* Upload Box */
            <label className="border-2 border-dashed border-[#C5A059]/40 hover:border-[#C5A059] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] transition-all group">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
              />
              <div className="w-14 h-14 rounded-full bg-white border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <p className="font-serif text-base sm:text-lg text-[#141312] mb-1 font-medium">
                Click to upload your photograph
              </p>
              <p className="font-sans text-xs text-[#5E564F] mb-4">
                Supports high-res JPG, PNG, WebP (Max 15MB)
              </p>
              <span className="btn-outline px-4 py-1.5 text-[11px] font-sans">
                Browse Files
              </span>
            </label>
          ) : (
            /* Live Camera View */
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#C5A059]/60 shadow-xl bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraFacing === "user" ? "scale-x-[-1]" : ""}`}
                />

                {/* Subtle Facial Alignment Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center border-4 border-dashed border-white/20 rounded-2xl m-4">
                  <div className="w-48 h-64 rounded-full border border-white/30 border-dashed" />
                </div>

                {/* Flip Camera Button */}
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 backdrop-blur-xs text-white hover:bg-black transition-colors"
                  title="Switch camera"
                >
                  <RefreshCw size={15} />
                </button>
              </div>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={captureSnapshot}
                className="w-16 h-16 rounded-full border-4 border-white bg-[#C5A059] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-[#141312]"
                title="Take snapshot"
              >
                <Camera size={26} />
              </button>
            </div>
          )}

          {/* Practical Guidelines & Privacy Notice */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-white/80 border border-[#C5A059]/20 text-xs font-sans space-y-1">
              <p className="font-semibold text-[#141312] flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#C5A059]" />
                <span>Photo Tip for {category.toUpperCase()}</span>
              </p>
              <p className="text-[#5E564F]">{getCategoryGuidance()}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 border border-[#C5A059]/20 text-xs font-sans space-y-1">
              <p className="font-semibold text-[#141312] flex items-center gap-1.5">
                <Shield size={13} className="text-[#C5A059]" />
                <span>100% Privacy Protection</span>
              </p>
              <p className="text-[#5E564F]">
                Your photo is securely processed in-memory and never stored on disk or used for AI training.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
