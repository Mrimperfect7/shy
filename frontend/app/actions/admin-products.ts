"use server";

import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import path from "path";
import { promises as fs } from "fs";

// 3D Try-On: category → body anchor mapping (code-based, no AI)
const TRYON_BODY_PART: Record<string, string> = { bangle: "wrist", bracelet: "wrist", ring: "finger", necklace: "neck" };
const TRYON_CATEGORY_NAME: Record<string, string> = { bangle: "Bangles", bracelet: "Bracelets", ring: "Rings", necklace: "Necklaces" };

async function resolveTryOnFields(formData: FormData) {
  const tryOnCategory = ((formData.get("tryOnCategory") as string) || "").trim() || null;
  const enabled = formData.get("tryOnEnabled") === "true" && !!tryOnCategory;
  const model3dUrl = ((formData.get("model3dUrl") as string) || "").trim() || null;
  let categoryId: string | undefined;
  if (tryOnCategory) {
    const cat = await prisma.category.upsert({
      where: { slug: tryOnCategory },
      update: {},
      create: { name: TRYON_CATEGORY_NAME[tryOnCategory] || tryOnCategory, slug: tryOnCategory },
    });
    categoryId = cat.id;
  }
  return {
    ...(categoryId ? { categoryId } : {}),
    tryOnEnabled: enabled,
    tryOnCategory,
    tryOnRefUrl: (formData.get("tryOnRefUrl") as string) || null,
    model3dUrl,
    tryOnBodyPart: enabled && tryOnCategory ? TRYON_BODY_PART[tryOnCategory] || null : null,
    tryOnConfig: enabled ? { scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] } : null,
  };
}

export async function uploadProductModelAction(formData: FormData) {
  try {
    const file = formData.get("model") as File;
    if (!file || file.size === 0) return { success: false, error: "No model file provided" };
    if (!/\.(glb|gltf)$/i.test(file.name)) return { success: false, error: "Only .glb / .gltf files are supported" };
    const buf = Buffer.from(await file.arrayBuffer());
    const dir = path.join(process.cwd(), "public", "models", "jewelry");
    await fs.mkdir(dir, { recursive: true });
    const safe = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    await fs.writeFile(path.join(dir, safe), buf);
    return { success: true, url: `/models/jewelry/${safe}` };
  } catch (error: any) {
    console.error("Model upload failed:", error);
    return { success: false, error: error.message || "Failed to upload model" };
  }
}

export async function uploadProductImageAction(formData: FormData) {
  try {
    const file = formData.get("image") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "No image file provided" };
    }
    const blob = await put(`products/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
    return { success: true, url: blob.url };
  } catch (error: any) {
    console.error("Image upload failed:", error);
    return { success: false, error: error.message || "Failed to upload image" };
  }
}

export async function createProductAction(formData: FormData) {
  const title = formData.get("title") as string;
  const slugInput = formData.get("slug") as string;
  const descriptionHtml = (formData.get("descriptionHtml") as string) || "";
  const price = parseFloat(formData.get("price") as string);
  const compareAtPriceStr = formData.get("compareAtPrice") as string;
  const compareAtPrice = compareAtPriceStr ? parseFloat(compareAtPriceStr) : null;
  const status = (formData.get("status") as string) || "ACTIVE";
  const inventoryStr = formData.get("inventory") as string;
  const inventory = inventoryStr ? parseInt(inventoryStr) : 100;
  
  const imageUrlsJson = (formData.get("imageUrls") as string) || (formData.get("existingImages") as string) || "[]";
  const images = formData.getAll("image") as File[];
  
  if (!title || isNaN(price)) {
    return { success: false, error: "Title and a valid price are required" };
  }

  try {
    let imageUrls: string[] = [];
    try {
      imageUrls = JSON.parse(imageUrlsJson);
    } catch {
      imageUrls = [];
    }
    
    // Upload images to Vercel Blob if provided directly
    const uploadPromises = images.filter(img => img && img.size > 0).map(async (image) => {
      const blob = await put(`products/${Date.now()}-${image.name}`, image, {
        access: 'public',
      });
      return blob.url;
    });
    
    if (uploadPromises.length > 0) {
      const uploaded = await Promise.all(uploadPromises);
      imageUrls = [...imageUrls, ...uploaded];
    }

    const slug = slugInput?.trim()
      ? slugInput.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        descriptionHtml,
        price,
        compareAtPrice,
        imageUrls,
        status,
        inventory,
        ...((await resolveTryOnFields(formData)) as any),
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true, product };
  } catch (error: any) {
    console.error("Prisma error:", error);
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function updateProductAction(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slugInput = formData.get("slug") as string;
  const descriptionHtml = (formData.get("descriptionHtml") as string) || "";
  const price = parseFloat(formData.get("price") as string);
  const compareAtPriceStr = formData.get("compareAtPrice") as string;
  const compareAtPrice = compareAtPriceStr ? parseFloat(compareAtPriceStr) : null;
  const status = (formData.get("status") as string) || "ACTIVE";
  const inventoryStr = formData.get("inventory") as string;
  const inventory = inventoryStr ? parseInt(inventoryStr) : 0;
  
  const imageUrlsJson = (formData.get("imageUrls") as string) || (formData.get("existingImages") as string) || "[]";
  const newImages = formData.getAll("image") as File[];

  if (!id || !title || isNaN(price)) {
    return { success: false, error: "Product ID, Title, and valid Price are required" };
  }

  try {
    let imageUrls: string[] = [];
    try {
      imageUrls = JSON.parse(imageUrlsJson);
    } catch {
      imageUrls = [];
    }

    // Upload any newly selected images to Vercel Blob
    const uploadPromises = newImages.filter(img => img && img.size > 0).map(async (image) => {
      const blob = await put(`products/${Date.now()}-${image.name}`, image, {
        access: 'public',
      });
      return blob.url;
    });

    if (uploadPromises.length > 0) {
      const uploadedUrls = await Promise.all(uploadPromises);
      imageUrls = [...imageUrls, ...uploadedUrls];
    }

    const slug = slugInput?.trim() 
      ? slugInput.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title,
        slug,
        descriptionHtml,
        price,
        compareAtPrice,
        imageUrls,
        status,
        inventory,
        ...((await resolveTryOnFields(formData)) as any),
      }
    });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${updated.slug}`);
    revalidatePath("/shop");
    revalidatePath("/");
    
    return { success: true, product: updated };
  } catch (error: any) {
    console.error("Prisma update error:", error);
    return { success: false, error: error.message || "Failed to update product" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    // Delete any attached reviews or order items if necessary
    await prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { productId: id } });
      await tx.orderItem.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return { success: false, error: error.message || "Failed to delete product" };
  }
}

export async function updateInventoryAction(id: string, newInventory: number) {
  try {
    await prisma.product.update({
      where: { id },
      data: { inventory: newInventory }
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update inventory" };
  }
}


