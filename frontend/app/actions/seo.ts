"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveSeoMetadata(data: {
  entityType: string;
  entityId: string;
  title?: string | null;
  description?: string | null;
  canonicalUrl?: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
}) {
  try {
    const { entityType, entityId, ...rest } = data;
    
    await prisma.seoMetadata.upsert({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
      update: rest,
      create: {
        entityType,
        entityId,
        ...rest,
      },
    });

    revalidatePath(`/admin/seo`);
    
    if (entityType === "PAGE") {
      revalidatePath(`/${entityId === "home" ? "" : entityId}`);
    } else if (entityType === "PRODUCT") {
      revalidatePath(`/products/${entityId}`);
    } else if (entityType === "CATEGORY") {
      revalidatePath(`/collections/${entityId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving SEO metadata", error);
    return { success: false, error: "Failed to save SEO metadata" };
  }
}
