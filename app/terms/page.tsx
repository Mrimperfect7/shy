import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | SHYN.ISH",
  description: "Read the Terms of Service for SHYN.ISH. Your use of this site constitutes acceptance of these terms.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service | SHYN.ISH",
    description: "Read the Terms of Service for SHYN.ISH.",
    url: "/terms",
    siteName: "SHYN.ISH",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="text-xs tracking-widest uppercase text-[#C5A059] mb-3 font-sans">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#141312] mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500 font-sans">Last updated: August 2026</p>
        </div>

        <div className="font-sans text-gray-700 space-y-8 leading-relaxed text-sm">
          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using the SHYN.ISH website (shynish.com), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">2. Products and Pricing</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We reserve the right to modify product prices at any time without prior notice.</li>
              <li>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes.</li>
              <li>We reserve the right to refuse or cancel any order in case of pricing errors.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">3. Orders and Payment</h2>
            <p>By placing an order, you confirm that all information provided is accurate and complete. Payment is processed securely through Razorpay, UPI, credit/debit cards, net banking, and wallets.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">4. Intellectual Property</h2>
            <p>All content on this website including text, graphics, logos, images, and software is the property of SHYN.ISH and is protected under Indian copyright laws. Unauthorized use is prohibited.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">5. Product Disclaimers & Care</h2>
            <p>Our jewellery pieces are crafted from 18K PVD gold plating over 316L/304 stainless steel. While designed for anti-tarnish everyday wear, proper care (avoiding direct abrasive chemicals, heavy bleach, or rough impacts) prolongs shine and finish longevity.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">6. Limitation of Liability</h2>
            <p>SHYN.ISH shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our products or services.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">7. Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">8. Contact Us</h2>
            <p>For any questions regarding these terms: <a href="mailto:support@shynish.com" className="text-[#C5A059] underline">support@shynish.com</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6 text-xs text-gray-500 font-sans">
          <Link href="/privacy" className="hover:text-[#C5A059] transition-colors">Privacy Policy</Link>
          <Link href="/refund-policy" className="hover:text-[#C5A059] transition-colors">Refund Policy</Link>
          <Link href="/shipping-policy" className="hover:text-[#C5A059] transition-colors">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
