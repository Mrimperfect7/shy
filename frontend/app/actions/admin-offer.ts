"use server";

import { put } from "@vercel/blob";

export async function uploadOfferImageAction(formData: FormData) {
  try {
    const file = formData.get("image") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "No image file provided" };
    }

    const blob = await put(`offer-images/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return { success: true, url: blob.url };
  } catch (error: any) {
    console.error("Failed to upload offer image:", error);
    return { success: false, error: error.message || "Failed to upload image" };
  }
}
