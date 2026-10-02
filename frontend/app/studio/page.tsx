import { Suspense } from "react";
import StudioWizard from "@/components/studio/StudioWizard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Visual Studio | SHYN.ISH",
  description: "Generate highly realistic marketing images of your jewellery using AI.",
};

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-[#F8F4EE] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C5A059]"></div>
          </div>
        }>
          <StudioWizard />
        </Suspense>
      </div>
    </div>
  );
}
