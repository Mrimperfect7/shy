"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(formData: FormData) {
  const name = formData.get("name") as string;
  const imageUrl = formData.get("imageUrl") as string;
  
  if (!name) return { success: false, error: "Name is required" };

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    const category = await prisma.category.create({
      data: { name, slug, imageUrl }
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true, category };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
