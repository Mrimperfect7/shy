import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | SHYN.ISH",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
