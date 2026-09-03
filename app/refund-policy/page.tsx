import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund & Return Policy | Eshara Naturals",
  description: "Learn about Eshara Naturals' refund, return, and exchange policy for hair oil products.",
  alternates: {
    canonical: "/refund-policy",
  },
  openGraph: {
    title: "Refund & Return Policy | Eshara Naturals",
    description: "Learn about Eshara Naturals' refund, return, and exchange policy for hair oil products.",
    url: "/refund-policy",
    siteName: "Eshara Naturals",
    type: "website",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="text-xs tracking-widest uppercase text-forest mb-3 font-sans">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">Refund & Return Policy</h1>
          <p className="text-sm text-gray-500 font-sans">Last updated: August 2026</p>
        </div>

        <div className="font-sans text-gray-700 space-y-8 leading-relaxed text-sm">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <p className="font-semibold text-green-800 mb-1">Our Promise to You</p>
            <p className="text-green-700">Your satisfaction is our priority. If you are not happy with your purchase, we are here to help.</p>
          </div>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">Returns</h2>
            <p>We accept returns within <strong>7 days</strong> of delivery for products that are:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Damaged or defective upon arrival.</li>
              <li>Incorrect items sent by us.</li>
              <li>Unopened and in original packaging.</li>
            </ul>
            <p className="mt-4 text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <strong>Note:</strong> Due to the nature of personal care products, we cannot accept returns on opened/used items unless they are defective.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">Refunds</h2>
            <p>Once your return is received and inspected, we will notify you of the refund status. If approved:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Refunds are processed within <strong>5–7 business days</strong>.</li>
              <li>The amount will be credited to your original payment method.</li>
              <li>Razorpay processing fees (if any) may be deducted.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">Exchanges</h2>
            <p>We only replace items if they are defective or damaged. If you need to exchange a product, please email us at <a href="mailto:support@esharanatural.com" className="text-forest underline">support@esharanatural.com</a> with your order ID and photos of the damaged product.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">Non-Returnable Items</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Products that have been opened or used.</li>
              <li>Items purchased on sale or with a discount code (except if defective).</li>
              <li>Gift cards.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">How to Initiate a Return</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Email us at <a href="mailto:support@esharanatural.com" className="text-forest underline">support@esharanatural.com</a> with your order number and reason for return.</li>
              <li>We will send you the return shipping address.</li>
              <li>Once we receive and inspect the item, we will process your refund.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">Contact Us</h2>
            <p>For any refund or return queries: <a href="mailto:support@esharanatural.com" className="text-forest underline">support@esharanatural.com</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6 text-xs text-gray-500 font-sans">
          <Link href="/privacy" className="hover:text-forest transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-forest transition-colors">Terms of Service</Link>
          <Link href="/shipping-policy" className="hover:text-forest transition-colors">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
