import { redirect } from "next/navigation";
import { getCustomerToken } from "@/app/actions/customer";
import { verifySession } from "@/lib/auth/session";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getCustomerToken();
  if (token) {
    const session = await verifySession(token);
    if (session) {
      if (session.role === "ADMIN") {
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
