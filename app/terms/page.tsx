import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Eshara Naturals",
  description: "Read the Terms of Service for Eshara Naturals. Your use of this site constitutes acceptance of these terms.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service | Eshara Naturals",
    description: "Read the Terms of Service for Eshara Naturals.",
    url: "/terms",
    siteName: "Eshara Naturals",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="text-xs tracking-widest uppercase text-forest mb-3 font-sans">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500 font-sans">Last updated: August 2026</p>
        </div>

        <div className="font-sans text-gray-700 space-y-8 leading-relaxed text-sm">
          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using the Eshara Naturals website (esharanatural.com), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">2. Products and Pricing</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We reserve the right to modify product prices at any time without prior notice.</li>
              <li>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes.</li>
              <li>We reserve the right to refuse or cancel any order in case of pricing errors.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">3. Orders and Payment</h2>
            <p>By placing an order, you confirm that all information provided is accurate and complete. Payment is processed securely through Razorpay. We accept UPI, credit/debit cards, net banking, and wallets.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">4. Intellectual Property</h2>
            <p>All content on this website including text, graphics, logos, images, and software is the property of Eshara Naturals and is protected under Indian copyright laws. Unauthorized use is prohibited.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">5. Product Disclaimers</h2>
            <p>Our products are made with natural botanical ingredients. Results may vary between individuals. Our products are not intended to diagnose, treat, cure, or prevent any medical condition. Please perform a patch test before use if you have sensitive skin.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">6. Limitation of Liability</h2>
            <p>Eshara Naturals shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our products or services.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">7. Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">8. Contact Us</h2>
            <p>For any questions regarding these terms: <a href="mailto:support@esharanatural.com" className="text-forest underline">support@esharanatural.com</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6 text-xs text-gray-500 font-sans">
          <Link href="/privacy" className="hover:text-forest transition-colors">Privacy Policy</Link>
          <Link href="/refund-policy" className="hover:text-forest transition-colors">Refund Policy</Link>
          <Link href="/shipping-policy" className="hover:text-forest transition-colors">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
