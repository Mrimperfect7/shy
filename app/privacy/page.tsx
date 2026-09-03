import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Eshara Naturals",
  description: "Read the Privacy Policy for Eshara Naturals. Learn how we collect, use, and protect your personal information.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Eshara Naturals",
    description: "Learn how Eshara Naturals collects, uses, and protects your personal information.",
    url: "/privacy",
    siteName: "Eshara Naturals",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="text-xs tracking-widest uppercase text-forest mb-3 font-sans">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 font-sans">Last updated: August 2026</p>
        </div>

        <div className="prose prose-sm max-w-none font-sans text-gray-700 space-y-8 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">1. Information We Collect</h2>
            <p>When you visit Eshara Naturals, we may collect the following information:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Your name, email address, phone number, and shipping address when you place an order.</li>
              <li>Payment information (processed securely through Razorpay; we do not store card details).</li>
              <li>Browser and device information for analytics purposes.</li>
              <li>Cookies to remember your cart and preferences.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To process and fulfill your orders.</li>
              <li>To send order confirmations and shipping updates.</li>
              <li>To respond to your customer service inquiries.</li>
              <li>To send promotional emails (you can unsubscribe at any time).</li>
              <li>To improve our website and product offerings.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">3. Data Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Shipping partners (e.g., Shiprocket, Delhivery) to fulfill your orders.</li>
              <li>Payment processors (Razorpay) to handle transactions securely.</li>
              <li>Analytics tools (e.g., Vercel Analytics) in anonymized form.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">4. Cookies</h2>
            <p>We use cookies to maintain your shopping cart session and provide a personalized experience. You can disable cookies in your browser settings, but this may affect certain features of the site.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information. All payment processing is handled by Razorpay, which is PCI-DSS compliant.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction or deletion of your data.</li>
              <li>Unsubscribe from marketing communications at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">7. Contact Us</h2>
            <p>If you have any questions about this privacy policy, please contact us at <a href="mailto:support@esharanatural.com" className="text-forest underline">support@esharanatural.com</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6 text-xs text-gray-500 font-sans">
          <Link href="/terms" className="hover:text-forest transition-colors">Terms of Service</Link>
          <Link href="/refund-policy" className="hover:text-forest transition-colors">Refund Policy</Link>
          <Link href="/shipping-policy" className="hover:text-forest transition-colors">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
