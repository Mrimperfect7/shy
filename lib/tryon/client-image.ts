/**
 * Client-side image compression and validation utilities for Virtual Try-On
 */

export interface ProcessedImage {
  dataUrl: string;
  width: number;
  height: number;
  fileSizeKb: number;
}

export async function compressAndFormatImage(
  fileOrBlob: File | Blob,
  maxDimension = 1280,
  quality = 0.88
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (fileOrBlob.type && !fileOrBlob.type.startsWith("image/")) {
      return reject(new Error("Please upload a valid image file (JPG, PNG, WebP)."));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image. File may be corrupt."));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          return reject(new Error("Failed to initialize canvas context for image processing."));
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const fileSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          width,
          height,
          fileSizeKb,
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(fileOrBlob);
  });
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|heic)$/i)) {
    return { valid: false, error: "Unsupported file format. Please upload JPG, PNG, or WebP." };
  }

  const maxBytes = 15 * 1024 * 1024; // 15 MB
  if (file.size > maxBytes) {
    return { valid: false, error: "Image file is too large. Maximum allowed size is 15MB." };
  }

  return { valid: true };
}
