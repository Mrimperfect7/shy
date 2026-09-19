"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession, setSessionCookie, clearSession, verifySession } from "@/lib/auth/session";
import { cookies } from "next/headers";

const COOKIE_NAME = "eshara_session";

export async function customerLogin(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { influencer: true },
    });

    if (!user || !user.isActive) {
      return { success: false, error: "Invalid credentials" };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid credentials" };
    }

    // Create session
    const token = await createSession({
      userId: user.id,
      role: user.role,
      influencerId: user.influencer?.id,
      email: user.email,
      name: user.name,
    });
    
    await setSessionCookie(token);

    // If it's a customer, ensure they have a referral profile
    if (user.role === "CUSTOMER") {
      const normalizedEmail = email.toLowerCase();
      let profile = await prisma.customerReferralProfile.findUnique({
        where: { email: normalizedEmail }
      });

      const cookieStore = await cookies();

      if (!profile) {
        const referralCookie = cookieStore.get("eshara_referral")?.value;
        const baseCode = normalizedEmail.split('@')[0].toUpperCase().replace(/[^A-Z]/g, '').substring(0, 5);
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const uniqueCode = `${baseCode}${randomStr}`;

        profile = await prisma.customerReferralProfile.create({
          data: {
            email: normalizedEmail,
            referralCode: uniqueCode,
            referredByCode: referralCookie || null,
          }
        });

        if (referralCookie) {
          await prisma.customerReferralProfile.update({
            where: { referralCode: referralCookie },
            data: { pendingReferrals: { increment: 1 } }
          });
        }
      }

      if (!profile.hasSeenPopup) {
        const settings = await prisma.referralSettings.findUnique({ where: { id: "singleton" } });
        if (settings?.popupEnabled !== false) {
          cookieStore.set("eshara_show_referral_popup", "true", { path: "/" });
        }
      }
    }

    const redirectPath = (user.role === "ADMIN" || user.role === "SUPERADMIN") ? "/admin" : user.role === "INFLUENCER" ? "/influencer" : "/account";

    return { success: true, redirect: redirectPath };
  } catch (err: any) {
    console.error("Login failed:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function customerRegister(input: any) {
  try {
    const { email, password, firstName, lastName } = input;
    const name = `${firstName} ${lastName}`.trim();

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: "CUSTOMER",
      }
    });

    return await customerLogin(email, password);
  } catch (err: any) {
    console.error("Registration failed:", err);
    return { success: false, error: "Failed to register account." };
  }
}

import { sendOtpEmail } from "@/lib/email/sender";

export async function customerRecoverAction(email: string) {
  return await requestPasswordResetOtp(email);
}

export async function requestPasswordResetOtp(email: string) {
  try {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please provide a valid email address." };
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return { 
        success: false, 
        error: "No account found with this email address. Please check your email or register a new account." 
      };
    }

    // Invalidate any previous unused OTPs for this email
    await prisma.passwordResetToken.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true }
    });

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Store in Database
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        otp,
        expiresAt,
        used: false,
      }
    });

    // Send email with OTP code
    const emailResult = await sendOtpEmail({
      toEmail: normalizedEmail,
      customerName: user.name,
      otp
    });

    let message = `A 6-digit verification code has been sent to ${normalizedEmail}.`;
    if (!emailResult.success && emailResult.error) {
      if (emailResult.devOtp) {
        message = `${emailResult.error} (Dev code: ${emailResult.devOtp})`;
      } else {
        return { success: false, error: emailResult.error };
      }
    } else if (emailResult.provider === "DEVELOPMENT_FALLBACK" && emailResult.devOtp) {
      message = `Verification code generated. (Dev code: ${emailResult.devOtp})`;
    }

    return { 
      success: true, 
      message,
      expiresInMinutes: 15,
      devOtp: emailResult.devOtp
    };
  } catch (err: any) {
    console.error("[requestPasswordResetOtp] Error:", err);
    return { success: false, error: "Failed to generate password reset code. Please try again." };
  }
}

export async function verifyPasswordResetOtpAndResetPassword(input: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  try {
    const { email, otp, newPassword } = input;

    if (!email || !otp || !newPassword) {
      return { success: false, error: "Missing required fields." };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // Verify OTP in Database
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        email: normalizedEmail,
        otp: cleanOtp,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" }
    });

    if (!tokenRecord) {
      return { success: false, error: "Invalid or expired verification code. Please request a new OTP." };
    }

    // Mark OTP as used
    await prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { used: true }
    });

    // Hash new password and update User
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { email: normalizedEmail },
      data: { passwordHash: newPasswordHash }
    });

    // Fetch influencer relation for session payload if applicable
    const influencer = await prisma.influencer.findUnique({
      where: { userId: updatedUser.id },
      select: { id: true }
    });

    // Automatically create session and log customer in
    const token = await createSession({
      userId: updatedUser.id,
      role: updatedUser.role,
      influencerId: influencer?.id,
      email: updatedUser.email,
      name: updatedUser.name,
    });
    
    await setSessionCookie(token);

    const redirectPath = (updatedUser.role === "ADMIN" || updatedUser.role === "SUPERADMIN") ? "/admin" : updatedUser.role === "INFLUENCER" ? "/influencer" : "/account";

    return { 
      success: true, 
      message: "Password reset successful! You are now logged in.",
      redirect: redirectPath
    };
  } catch (err: any) {
    console.error("[verifyPasswordResetOtpAndResetPassword] Error:", err);
    return { success: false, error: "Failed to reset password. Please try again." };
  }
}

export async function customerLogout() {
  await clearSession();
  return { success: true };
}

export async function getCustomerToken() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

export async function markReferralPopupSeen() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return { success: false };

  cookieStore.delete("eshara_show_referral_popup");
  
  // Decrypt session to get user email
  try {
    const session = await verifySession(token);
    
    if (session && session.email) {
      await prisma.customerReferralProfile.update({
        where: { email: session.email.toLowerCase() },
        data: { hasSeenPopup: true }
      });
    }
  } catch (err) {
    console.error("Error marking popup seen:", err);
  }

  return { success: true };
}
