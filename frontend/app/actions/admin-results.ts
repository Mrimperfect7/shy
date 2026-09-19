"use server";

import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function createCustomerResultAction(formData: FormData) {
  try {
    const image = formData.get("image") as File;
    const description = formData.get("description") as string;
    const isPublished = formData.get("isPublished") === "true";
    
    if (!image || image.size === 0) {
      return { success: false, error: "Image file is required" };
    }

    // Upload to Vercel Blob
    const blob = await put(`customer-results/${Date.now()}-${image.name}`, image, {
      access: 'public',
    });
    
    const imageUrl = blob.url;

    // Get max displayOrder
    const maxResult = await prisma.customerResult.findFirst({ 
      orderBy: { displayOrder: "desc" } 
    });
    const order = (maxResult?.displayOrder ?? 0) + 1;

    const newResult = await prisma.customerResult.create({
      data: {
        imageUrl,
        description: description || null,
        isPublished,
        displayOrder: order,
      }
    });

    return { success: true, result: newResult };
  } catch (error: any) {
    console.error("Failed to create customer result:", error);
    return { success: false, error: error.message || "Failed to create customer result" };
  }
}
