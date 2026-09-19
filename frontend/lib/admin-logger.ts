import { prisma } from "@/lib/db";

export async function logAdminActivity(
  adminEmail: string,
  actionType: string,
  details?: string
) {
  try {
    await prisma.adminActivity.create({
      data: {
        adminEmail,
        actionType,
        details,
      },
    });
  } catch (error) {
    // Log failure silently to not break the main API flow
    console.error("Failed to log admin activity:", error);
  }
}
