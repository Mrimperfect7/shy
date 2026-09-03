"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import ReferralPopup from "@/components/account/ReferralPopup";
import OfferAdPopup from "@/components/shared/OfferAdPopup";
import PollPopup from "@/components/shared/PollPopup";
import FloatingButtons from "@/components/shared/FloatingButtons";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide all storefront layout elements on admin pages
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main id="main">{children}</main>;
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <ReferralPopup />
      <OfferAdPopup />
      <PollPopup />
      <FloatingButtons />
    </>
  );
}
