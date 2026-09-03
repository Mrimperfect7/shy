import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | Eshara Naturals",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
