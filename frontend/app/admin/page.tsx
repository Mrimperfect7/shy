import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/shopify/products";
import { 
  ShoppingBag, 
  IndianRupee, 
  Package, 
  MapPin, 
  Phone, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Clock
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import OrderEditModal from "@/components/admin/OrderEditModal";
import OrderStatusSelector from "@/components/admin/OrderStatusSelector";

function MetricCard({ title, value, icon: Icon, trend, href, highlight = false, badgeColor = "forest" }: any) {
  return (
    <Link href={href} className="block group">
      <div className={`bg-white rounded-2xl p-6 border shadow-sm transition-all hover:shadow-md hover:border-gray-300 ${highlight ? 'ring-1 ring-emerald-300 bg-emerald-50/20' : ''}`} style={{ borderColor: "rgba(26,26,26,0.1)" }}>
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-xl" style={{ background: "rgba(66,89,68,0.1)", color: "var(--forest)" }}>
            <Icon size={22} />
          </div>
        </div>
        <h3 className="text-xs font-sans font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</h3>
        <p className="font-serif text-2xl mb-1.5 text-gray-900 font-bold">{value}</p>
        <div className="flex items-center text-xs text-gray-500 font-sans">
          <span>{trend}</span>
        </div>
      </div>
    </Link>
  );
}

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const [orders, metrics, settings] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        paymentAttempts: {
          orderBy: { createdAt: "desc" },
          take: 1,
        }
      },
    }),
    prisma.$transaction([
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
      prisma.influencer.count(),
      prisma.coupon.count({ where: { status: "ACTIVE" } })
    ]),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } })
  ]);

  const [
    totalOrdersCount,
    paidOrdersCount,
    pendingOrdersCount,
    totalProducts,
    totalInfluencers,
    activeCoupons
  ] = metrics;

  const verifiedRevenue = orders
    .filter(o => o.status === "PAID" || o.status === "SHIPPED" || o.status === "DELIVERED")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);


  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-1" style={{ color: "var(--charcoal)" }}>Dashboard Overview</h1>
          <p className="font-sans text-sm text-gray-500">Live overview of orders by status, verified revenue, and product catalog.</p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--forest)] text-white text-xs font-sans font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          <Package size={15} />
          <span>Manage All Orders ({totalOrdersCount})</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Verified Store Revenue" 
          value={`₹${verifiedRevenue.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          trend={`${paidOrdersCount} verified payments`}
          href="/admin/orders?status=PAID"
          highlight={true}
        />
        <MetricCard 
          title="Pending Verification" 
          value={pendingOrdersCount.toString()} 
          icon={Clock}
          trend={pendingOrdersCount > 0 ? "⚠️ Requires UTR review" : "All orders verified"}
          href="/admin/orders?status=PENDING"
        />
        <MetricCard 
          title="Total Store Orders" 
          value={totalOrdersCount.toString()} 
          icon={Package}
          trend={`${paidOrdersCount} confirmed · ${pendingOrdersCount} pending`}
          href="/admin/orders"
        />
        <MetricCard 
          title="Catalog & Partners" 
          value={`${totalProducts} Prods`} 
          icon={ShoppingBag}
          trend={`${totalInfluencers} influencers · ${activeCoupons} coupons`}
          href="/admin/products"
        />
      </div>


      {/* Recent Customer Orders Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mt-8" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-xl" style={{ color: "var(--charcoal)" }}>Recent Orders &amp; Payment Status</h2>
            <p className="text-xs text-gray-500 font-sans mt-0.5">Live feed of orders with claimed UPI reference numbers (UTRs).</p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-sans font-semibold text-forest hover:underline inline-flex items-center gap-1"
          >
            Manage All Orders <ArrowRight size={13} />
          </Link>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-sans text-sm border-2 border-dashed rounded-xl">
            No customer orders received yet. Once customers place orders, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider text-gray-400" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer &amp; Contact</th>
                  <th className="pb-3 font-semibold">Delivery Address</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">UPI Ref / UTR</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const rawAddress: any = order.shippingAddress || {};
                  const cleanPhone = (order.customerPhone || "").replace(/\D/g, "");
                  const whatsappLink = cleanPhone.length >= 10 ? `https://wa.me/91${cleanPhone.slice(-10)}` : null;
                  const latestAttempt = order.paymentAttempts?.[0];
                  const txId = order.paymentId || latestAttempt?.transactionId;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Order Number */}
                      <td className="py-4 font-mono font-bold text-gray-900 text-xs">
                        <Link href="/admin/orders" className="hover:text-forest underline">
                          {order.orderNumber}
                        </Link>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-4">
                        <p className="font-semibold text-gray-900 text-xs">{order.customerName}</p>
                        {order.customerPhone && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
                            <Phone size={10} />
                            <span>{order.customerPhone}</span>
                            {whatsappLink && (
                              <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700 font-medium"
                                title="Chat on WhatsApp"
                              >
                                <WhatsAppIcon size={12} fill="#25D366" />
                              </a>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Address */}
                      <td className="py-4 max-w-xs">
                        <p className="text-xs text-gray-700 truncate" title={rawAddress.address}>
                          {rawAddress.address || "—"}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {[rawAddress.city, rawAddress.state].filter(Boolean).join(", ")}
                          {rawAddress.pinCode ? ` - ${rawAddress.pinCode}` : ""}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="py-4 font-bold text-emerald-900 text-xs">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </td>

                      {/* UPI UTR / Transaction ID */}
                      <td className="py-4">
                        {txId ? (
                          <span className="font-mono text-[11px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-bold border border-gray-200 select-all">
                            {txId}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">No UTR</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                      </td>

                      {/* Date */}
                      <td className="py-4 text-xs text-gray-500 font-mono">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>

                      {/* Action Modal */}
                      <td className="py-4 text-right">
                        <OrderEditModal order={order} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
