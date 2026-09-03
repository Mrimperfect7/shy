import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secretString = process.env.SESSION_SECRET;
if (!secretString || secretString === "your_super_secret_32_character_string_for_jwt") {
  if (process.env.NODE_ENV === "production") {
    throw new Error("A strong SESSION_SECRET environment variable is required in production.");
  }
  console.warn("⚠️ Using fallback session secret. Ensure SESSION_SECRET is set securely in production.");
}
const SECRET = new TextEncoder().encode(
  secretString && secretString !== "your_super_secret_32_character_string_for_jwt" 
    ? secretString 
    : "fallback-dev-secret-change-in-production-32chars"
);

export interface SessionPayload {
  userId: string;
  role: "SUPERADMIN" | "ADMIN" | "INFLUENCER" | "CUSTOMER";
  influencerId?: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export async function createSession(payload: Omit<SessionPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("eshara_session")?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  // Secure httpOnly session token
  cookieStore.set("eshara_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  // Non-httpOnly indicator so the client-side header can read it immediately (no sensitive data)
  cookieStore.set("eshara_logged_in", "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("eshara_session");
  cookieStore.delete("eshara_logged_in");
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireSuperAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    throw new Error("Unauthorized");
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Superadmin access disabled in production");
  }
  return session;
}

export async function requireInfluencer(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== "INFLUENCER") {
    throw new Error("Unauthorized");
  }
  return session;
}
