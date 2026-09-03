"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getSiteSettings() {
  const cookieStore = await cookies();
  const session = cookieStore.get("eshara_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: "singleton",
          shampooLaunched: false,
          skincareLaunched: false,
        }
      });
    }
    return { success: true, settings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLaunchSettings(shampooLaunched: boolean, skincareLaunched: boolean) {
  const cookieStore = await cookies();
  const session = cookieStore.get("eshara_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: { shampooLaunched, skincareLaunched },
      create: {
        id: "singleton",
        shampooLaunched,
        skincareLaunched
      }
    });
    
    revalidatePath("/");
    return { success: true, settings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
