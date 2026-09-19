"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createPoll(question: string, optionTexts: string[]) {
  const cookieStore = await cookies();
  const session = cookieStore.get("eshara_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const newPoll = await prisma.poll.create({
      data: {
        question,
        isActive: false,
        options: {
          create: optionTexts.map(text => ({ text }))
        }
      }
    });
    revalidatePath("/admin/polls");
    return { success: true, poll: newPoll };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function setActivePoll(pollId: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("eshara_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    // Set all polls to inactive
    await prisma.poll.updateMany({
      data: { isActive: false }
    });
    
    // Set target poll to active
    if (pollId) {
      await prisma.poll.update({
        where: { id: pollId },
        data: { isActive: true }
      });
    }

    revalidatePath("/admin/polls");
    revalidatePath("/"); // Update storefront
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePoll(pollId: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("eshara_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.poll.delete({
      where: { id: pollId }
    });
    revalidatePath("/admin/polls");
    revalidatePath("/"); 
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
