import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerToken } from "@/app/actions/customer";
import { verifySession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign In | SHYN.ISH",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getCustomerToken();
  if (token) {
    const session = await verifySession(token);
    if (session) {
      if (session.role === "ADMIN" || session.role === "SUPERADMIN") {
        redirect("/admin");
      } else if (session.role === "INFLUENCER") {
        redirect("/influencer");
      } else {
        redirect("/account");
      }
    }
  }

  return <>{children}</>;
}
