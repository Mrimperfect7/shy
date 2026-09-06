import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund & Return Policy | SHYN.ISH",
  description: "Learn about SHYN.ISH refund, return, and exchange policy for jewellery products.",
  alternates: {
    canonical: "/refund-policy",
  },
  openGraph: {
    title: "Refund & Return Policy | SHYN.ISH",
    description: "Learn about SHYN.ISH refund, return, and exchange policy for jewellery products.",
    url: "/refund-policy",
    siteName: "SHYN.ISH",
    type: "website",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="text-xs tracking-widest uppercase text-[#C5A059] mb-3 font-sans">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#141312] mb-4">Refund & Return Policy</h1>
          <p className="text-sm text-gray-500 font-sans">Last updated: August 2026</p>
        </div>

        <div className="font-sans text-gray-700 space-y-8 leading-relaxed text-sm">
          <div className="bg-[#FAF8F5] border border-[#C5A059]/30 rounded-xl p-5">
            <p className="font-semibold text-[#141312] mb-1">Our Quality Promise</p>
            <p className="text-gray-700">Every piece of SHYN.ISH jewellery is crafted with 18K PVD gold plating and hypoallergenic surgical steel. Your satisfaction is our priority.</p>
          </div>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">Returns</h2>
            <p>We accept return or exchange requests within <strong>7 days</strong> of delivery for products that are:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Damaged, scratched, or defective upon arrival.</li>
              <li>Incorrect item sent by us.</li>
              <li>Unworn, in original brand packaging and condition.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">Refunds</h2>
            <p>Once your return is received and inspected, we will notify you of the approval or rejection:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Approved refunds are processed within <strong>5–7 business days</strong>.</li>
              <li>The amount will be credited to your original payment method.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">Exchanges & Replacements</h2>
            <p>We replace items if they arrive defective, damaged, or with fitting issues. Please email us at <a href="mailto:support@shynish.com" className="text-[#C5A059] underline">support@shynish.com</a> with your order ID and unboxing photos/video.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">How to Initiate a Return</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Email us at <a href="mailto:support@shynish.com" className="text-[#C5A059] underline">support@shynish.com</a> with your order number and photo proof.</li>
              <li>Our customer care team will review and approve pickup or provide return instructions.</li>
              <li>Upon inspection, your replacement or refund will be swiftly processed.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">Contact Us</h2>
            <p>For any refund or return queries: <a href="mailto:support@shynish.com" className="text-[#C5A059] underline">support@shynish.com</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6 text-xs text-gray-500 font-sans">
          <Link href="/privacy" className="hover:text-[#C5A059] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#C5A059] transition-colors">Terms of Service</Link>
          <Link href="/shipping-policy" className="hover:text-[#C5A059] transition-colors">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
