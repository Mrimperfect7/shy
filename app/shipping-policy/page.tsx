import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping Policy | SHYN.ISH",
  description: "Learn about SHYN.ISH shipping timelines, delivery partners, and charges across India.",
  alternates: {
    canonical: "/shipping-policy",
  },
  openGraph: {
    title: "Shipping Policy | SHYN.ISH",
    description: "Learn about SHYN.ISH shipping timelines, delivery partners, and charges across India.",
    url: "/shipping-policy",
    siteName: "SHYN.ISH",
    type: "website",
  },
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="text-xs tracking-widest uppercase text-[#C5A059] mb-3 font-sans">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#141312] mb-4">Shipping Policy</h1>
          <p className="text-sm text-gray-500 font-sans">Last updated: August 2026</p>
        </div>

        <div className="font-sans text-gray-700 space-y-8 leading-relaxed text-sm">
          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">Processing Time</h2>
            <p>All jewellery orders are carefully inspected, sanitized, and packed in luxury protective presentation boxes within <strong>1–2 business days</strong> (Monday to Saturday, excluding public holidays) after receiving your order confirmation.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">Shipping Times</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse mt-3">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 font-semibold text-[#141312]">Location</th>
                    <th className="pb-3 font-semibold text-[#141312]">Estimated Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="py-3">Metro Cities (Mumbai, Delhi, Bangalore, etc.)</td><td className="py-3">3–5 business days</td></tr>
                  <tr><td className="py-3">Tier 2 & 3 Cities</td><td className="py-3">4–7 business days</td></tr>
                  <tr><td className="py-3">Remote Areas / Rural Pincodes</td><td className="py-3">7–10 business days</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">Shipping Charges</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Standard Express Delivery across India — <strong>Flat ₹40</strong> (or Free Shipping during promotional campaigns)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">Tracking Your Order</h2>
            <p>Once your package dispatches, you will receive a tracking link via email and/or WhatsApp/SMS. You can also visit our dedicated <Link href="/track-order" className="text-[#C5A059] underline">Track Order</Link> page anytime.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">Delivery Partners</h2>
            <p>We ship through trusted logistics partners including Delhivery, Shiprocket, and DTDC, ensuring insured and safe delivery to your doorstep.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">Undelivered / Returned Packages</h2>
            <p>If a package is returned to us due to an incorrect address or failed delivery attempts, our support team will contact you to coordinate re-dispatch.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#141312] mb-3">Contact Us</h2>
            <p>For shipping queries: <a href="mailto:support@shynish.com" className="text-[#C5A059] underline">support@shynish.com</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6 text-xs text-gray-500 font-sans">
          <Link href="/privacy" className="hover:text-[#C5A059] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#C5A059] transition-colors">Terms of Service</Link>
          <Link href="/refund-policy" className="hover:text-[#C5A059] transition-colors">Refund Policy</Link>
        </div>
      </div>
    </div>
  );
}
