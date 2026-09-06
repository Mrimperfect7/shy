import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Truck, 
  Search,
  ExternalLink,
  ShieldCheck,
  Tag,
  Sparkles,
  XCircle,
  IndianRupee,
  ShoppingBag
} from "lucide-react";
import OrderStatusSelector from "@/components/admin/OrderStatusSelector";
import OrderDeleteButton from "@/components/admin/OrderDeleteButton";
import OrderEditModal from "@/components/admin/OrderEditModal";
import ExportOrdersButton from "@/components/admin/ExportOrdersButton";
import TransactionVerificationBox from "@/components/admin/TransactionVerificationBox";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; coupon?: string }>;
}) {
  const { q, status = "ALL", coupon: selectedCoupon } = await searchParams;

  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status;
  }

  // Fetch all orders matching base criteria
  const [rawOrders, allOrdersForStats, allCoupons] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          include: {
            product: true,
          }
        },
        paymentAttempts: {
          orderBy: { createdAt: "desc" }
        }
      }
    }),
    prisma.order.findMany({
      select: {
        status: true,
        totalAmount: true,
        shippingAddress: true,
      }
    }),
    prisma.coupon.findMany({
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        usageCount: true,
        status: true,
      },
      orderBy: { usageCount: "desc" }
    })
  ]);

  // Client / In-memory filtering for JSON couponCode & search parameters
  let filteredOrders = rawOrders;

  if (selectedCoupon && selectedCoupon.trim()) {
    const normCoupon = selectedCoupon.trim().toUpperCase();
    filteredOrders = filteredOrders.filter(order => {
      // Strictly show only successful paid orders for coupon sales
      const isPaid = order.status === "PAID" || order.status === "SHIPPED" || order.status === "DELIVERED";
      const addr = (order.shippingAddress as any) || {};
      const matchesCoupon = addr?.couponCode && addr.couponCode.trim().toUpperCase() === normCoupon;
      
      // If user specifically picked another status like PENDING or CANCELLED, honor that status; otherwise default to successful paid orders
      if (status && status !== "ALL") {
        return matchesCoupon;
      }
      return isPaid && matchesCoupon;
    });
  }

  if (q && q.trim()) {
    const query = q.trim().toLowerCase();
    filteredOrders = filteredOrders.filter(order => {
      const addr = (order.shippingAddress as any) || {};
      const couponCode = (addr?.couponCode || "").toLowerCase();
      const orderNumber = order.orderNumber.toLowerCase();
      const name = (order.customerName || "").toLowerCase();
      const email = (order.customerEmail || "").toLowerCase();
      const phone = (order.customerPhone || "").toLowerCase();
      const paymentId = (order.paymentId || "").toLowerCase();
      const utr = (order.paymentAttempts?.[0]?.transactionId || "").toLowerCase();

      return (
        orderNumber.includes(query) ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        paymentId.includes(query) ||
        utr.includes(query) ||
        couponCode.includes(query)
      );
    });
  }

  // Global KPI Statistics
  const totalOrdersCount = allOrdersForStats.length;
  const verifiedRevenue = allOrdersForStats
    .filter(o => o.status === "PAID" || o.status === "SHIPPED" || o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = allOrdersForStats.filter(o => o.status === "PENDING").length;
  const paidOrdersCount = allOrdersForStats.filter(o => o.status === "PAID").length;
  const shippedOrdersCount = allOrdersForStats.filter(o => o.status === "SHIPPED").length;
  const deliveredOrdersCount = allOrdersForStats.filter(o => o.status === "DELIVERED").length;
  const cancelledOrdersCount = allOrdersForStats.filter(o => o.status === "CANCELLED").length;

  // Compute Used Coupons ONLY from successful paid orders (PAID, SHIPPED, DELIVERED)
  const couponStatsMap: Record<string, { count: number; totalSales: number; totalDiscount: number }> = {};
  
  allOrdersForStats.forEach(o => {
    const isPaid = o.status === "PAID" || o.status === "SHIPPED" || o.status === "DELIVERED";
    if (!isPaid) return; // Strictly ignore pending or cancelled orders for coupon sales

    const addr = (o.shippingAddress as any) || {};
    const code = addr?.couponCode ? addr.couponCode.trim().toUpperCase() : null;
    if (code) {
      if (!couponStatsMap[code]) {
        couponStatsMap[code] = { count: 0, totalSales: 0, totalDiscount: 0 };
      }
      couponStatsMap[code].count += 1;
      couponStatsMap[code].totalSales += o.totalAmount;
      couponStatsMap[code].totalDiscount += Number(addr?.discountAmount || 0);
    }
  });

  const availableUsedCoupons = Object.keys(couponStatsMap).sort(
    (a, b) => couponStatsMap[b].count - couponStatsMap[a].count
  );

  // Active Coupon Summary Stats (if filtered by coupon)
  const activeCouponData = selectedCoupon ? couponStatsMap[selectedCoupon.trim().toUpperCase()] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sans font-semibold tracking-wider uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Order Management Hub
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mt-2">
            Customer Orders &amp; Coupon Analytics
          </h1>
          <p className="text-gray-500 font-sans text-sm mt-1">
            Track order fulfillments, filter by promo/influencer coupon codes, and verify payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportOrdersButton orders={filteredOrders} />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-sans font-medium text-gray-500 block">Total Orders</span>
          <span className="font-serif text-2xl font-bold text-gray-900 mt-1 block">
            {totalOrdersCount}
          </span>
          <span className="text-[11px] font-sans text-gray-400 mt-0.5 block">All recorded purchases</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-sans font-medium text-gray-500 block">Verified / Paid Revenue</span>
          <span className="font-serif text-2xl font-bold text-emerald-800 mt-1 block">
            ₹{verifiedRevenue.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] font-sans text-emerald-600 mt-0.5 block">{paidOrdersCount + shippedOrdersCount + deliveredOrdersCount} verified orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-sm">
          <span className="text-xs font-sans font-bold text-amber-800 block">Pending Verification</span>
          <span className="font-serif text-2xl font-bold text-amber-900 mt-1 block">
            {pendingOrdersCount}
          </span>
          <span className="text-[11px] font-sans text-amber-700 mt-0.5 block">Awaiting admin review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-sm">
          <span className="text-xs font-sans font-medium text-purple-900 block">Coupon-Applied Orders</span>
          <span className="font-serif text-2xl font-bold text-purple-950 mt-1 block">
            {Object.values(couponStatsMap).reduce((acc, curr) => acc + curr.count, 0)}
          </span>
          <span className="text-[11px] font-sans text-purple-700 mt-0.5 block">
            {availableUsedCoupons.length} distinct promo codes used
          </span>
        </div>
      </div>

      {/* ── Active Coupon Filter Summary Banner ── */}
      {selectedCoupon && (
        <div className="p-5 rounded-2xl bg-purple-900 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-purple-300 shrink-0">
              <Tag size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans text-xs uppercase tracking-wider text-purple-300 font-semibold">
                  Paid Coupon Analytics
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-purple-500 text-white shadow-xs">
                  {selectedCoupon.toUpperCase()}
                </span>
              </div>
              <p className="font-serif text-xl sm:text-2xl font-medium mt-1">
                Showing successful paid orders for &quot;{selectedCoupon.toUpperCase()}&quot;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 self-stretch md:self-auto justify-between border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
            <div className="text-center md:text-right">
              <span className="text-xs text-purple-300 font-sans block">Paid Sales</span>
              <span className="font-serif text-xl font-bold text-emerald-300">
                ₹{(activeCouponData?.totalSales || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="text-center md:text-right">
              <span className="text-xs text-purple-300 font-sans block">Paid Orders</span>
              <span className="font-serif text-xl font-bold text-white">
                {activeCouponData?.count || 0}
              </span>
            </div>
            <div className="text-center md:text-right">
              <span className="text-xs text-purple-300 font-sans block">Total Discounts</span>
              <span className="font-serif text-xl font-bold text-amber-300">
                -₹{(activeCouponData?.totalDiscount || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <Link
                href={`/admin/orders?status=${status}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle size={14} />
                <span>Clear Coupon</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Search & Filter Panel ── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        
        {/* Search & Status Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <form method="GET" action="/admin/orders" className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              name="q" 
              defaultValue={q || ""}
              placeholder="Search by Coupon Code, Order #, Customer, Phone, UTR..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-forest"
            />
            {status && <input type="hidden" name="status" value={status} />}
            {selectedCoupon && <input type="hidden" name="coupon" value={selectedCoupon} />}
          </form>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { key: "ALL", label: `All (${totalOrdersCount})` },
              { key: "PENDING", label: `🟡 Pending (${pendingOrdersCount})` },
              { key: "PAID", label: `🟢 Paid (${paidOrdersCount})` },
              { key: "SHIPPED", label: `🚚 Shipped (${shippedOrdersCount})` },
              { key: "DELIVERED", label: `✅ Delivered (${deliveredOrdersCount})` },
              { key: "CANCELLED", label: `❌ Cancelled (${cancelledOrdersCount})` },
            ].map(({ key, label }) => (
              <Link
                key={key}
                href={`/admin/orders?status=${key}${selectedCoupon ? `&coupon=${encodeURIComponent(selectedCoupon)}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-colors whitespace-nowrap ${
                  status === key
                    ? "bg-[var(--forest)] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Quick Filter by Coupon Code Strip ── */}
        <div className="pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1 shrink-0">
            <Tag size={13} className="text-purple-600" />
            <span>Filter by Coupon:</span>
          </span>

          <Link
            href={`/admin/orders?status=${status}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`px-2.5 py-1 rounded-lg text-xs font-sans font-semibold transition-all ${
              !selectedCoupon 
                ? "bg-purple-900 text-white shadow-xs" 
                : "bg-purple-50 text-purple-800 hover:bg-purple-100"
            }`}
          >
            All Orders
          </Link>

          {availableUsedCoupons.length === 0 ? (
            <span className="text-xs font-sans text-gray-400 italic">No coupons used yet</span>
          ) : (
            availableUsedCoupons.map((code) => {
              const stat = couponStatsMap[code];
              const isSelected = selectedCoupon?.toUpperCase() === code;
              return (
                <Link
                  key={code}
                  href={`/admin/orders?coupon=${encodeURIComponent(code)}&status=${status}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans font-semibold transition-all border ${
                    isSelected
                      ? "bg-purple-700 text-white border-purple-800 shadow-sm"
                      : "bg-purple-50 text-purple-900 border-purple-200/80 hover:bg-purple-100"
                  }`}
                >
                  <span>🏷️ {code}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-purple-900 text-purple-200" : "bg-purple-200/80 text-purple-950"
                  }`}>
                    {stat.count} ({stat.count === 1 ? "order" : "orders"} · ₹{stat.totalSales.toLocaleString("en-IN")})
                  </span>
                </Link>
              );
            })
          )}
        </div>

      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <Package size={36} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-serif text-lg text-gray-700 font-bold mb-1">No Orders Found</h3>
          <p className="text-gray-400 font-sans text-xs max-w-sm mx-auto">
            {selectedCoupon 
              ? `No orders found using coupon code "${selectedCoupon}".`
              : q || status !== "ALL" 
              ? "No customer orders matched your current search filters." 
              : "When customers place orders on your store, they will appear here with full delivery details."}
          </p>
          {(selectedCoupon || q || status !== "ALL") && (
            <Link
              href="/admin/orders"
              className="mt-4 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-forest text-white text-xs font-sans font-semibold hover:bg-forest-light transition-colors"
            >
              Reset All Filters
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const rawAddress: any = order.shippingAddress || {};
            const cleanPhone = (order.customerPhone || "").replace(/\D/g, "");
            const whatsappLink = cleanPhone.length >= 10 
              ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(
                  `Hi ${order.customerName}! We have received your SHYN.ISH order *${order.orderNumber}* for ₹${order.totalAmount}.`
                )}`
              : null;

            const shippingUpdateLink = cleanPhone.length >= 10
              ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(
                  `Hi ${order.customerName}! Great news! ✨ Your SHYN.ISH order *${order.orderNumber}* has been dispatched via ${rawAddress.courierName || "Courier"}${rawAddress.trackingNumber ? ` (Tracking / AWB: ${rawAddress.trackingNumber})` : ""} and is on its way to ${rawAddress.city || "your address"}.`
                )}`
              : null;

            const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            const hasCoupon = Boolean(rawAddress?.couponCode);
            const couponCode = rawAddress?.couponCode ? String(rawAddress.couponCode).toUpperCase() : "";
            const discountAmount = Number(rawAddress?.discountAmount || 0);

            return (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-6 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-sm md:text-base text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-xs">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-gray-500 font-sans flex items-center gap-1">
                      <Calendar size={13} /> {formattedDate}
                    </span>
                    
                    {/* Prominent Coupon Badge on Order Header */}
                    {hasCoupon && (
                      <Link
                        href={`/admin/orders?coupon=${encodeURIComponent(couponCode)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-sans font-bold bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 px-3 py-1 rounded-lg shadow-xs transition-colors"
                        title={`Click to filter all orders with coupon ${couponCode}`}
                      >
                        <Tag size={12} className="text-purple-700" />
                        <span>Coupon: {couponCode}</span>
                        {discountAmount > 0 && (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono text-[11px]">
                            -₹{discountAmount}
                          </span>
                        )}
                      </Link>
                    )}

                    {rawAddress.trackingNumber && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                        <Truck size={11} /> {rawAddress.courierName || "Courier"}: {rawAddress.trackingNumber}
                      </span>
                    )}
                  </div>

                  {/* Live Status Selector & Action Modals */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <OrderEditModal order={order} />
                    <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                    <OrderDeleteButton orderId={order.id} orderNumber={order.orderNumber} />
                  </div>
                </div>

                {/* Main Order Content Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Customer & Delivery Address */}
                  <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
                    <div>
                      <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Customer Details
                      </span>
                      <h4 className="font-sans font-bold text-base text-gray-900">
                        {order.customerName}
                      </h4>

                      <div className="mt-2 space-y-1.5 text-xs font-sans text-gray-600">
                        {order.customerPhone && (
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-gray-400 shrink-0" />
                            <span className="font-mono font-medium text-gray-800">{order.customerPhone}</span>
                            {whatsappLink && (
                              <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded transition-colors"
                              >
                                <WhatsAppIcon size={11} fill="#25D366" /> Chat
                              </a>
                            )}
                          </div>
                        )}

                        {order.customerEmail && (
                          <div className="flex items-center gap-2">
                            <Mail size={13} className="text-gray-400 shrink-0" />
                            <a href={`mailto:${order.customerEmail}`} className="hover:underline text-gray-700">
                              {order.customerEmail}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address Box */}
                    <div className="bg-gray-50/90 rounded-xl p-3.5 border border-gray-200/80 text-xs font-sans">
                      <div className="flex items-center gap-1.5 text-gray-700 font-bold uppercase text-[10px] tracking-wider mb-1.5">
                        <MapPin size={13} className="text-forest" />
                        <span>Delivery Address</span>
                      </div>
                      <p className="text-gray-800 font-medium leading-relaxed whitespace-pre-line">
                        {rawAddress.address || "No street address provided"}
                      </p>
                      <p className="text-gray-600 mt-1 font-medium">
                        {[rawAddress.city, rawAddress.state].filter(Boolean).join(", ")}
                        {rawAddress.pinCode ? ` - PIN: ${rawAddress.pinCode}` : ""}
                      </p>
                    </div>

                    {/* Quick WhatsApp Shipping Notification Action */}
                    {shippingUpdateLink && (
                      <a
                        href={shippingUpdateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-sans text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Truck size={13} /> Send &quot;Order Dispatched&quot; WhatsApp
                      </a>
                    )}
                  </div>

                  {/* Right Column: Ordered Items & Payment Verification Section */}
                  <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                    
                    {/* Ordered Items List */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-gray-400 block">
                        Ordered Items ({order.orderItems.length})
                      </span>

                      <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
                        {order.orderItems.map((item) => {
                          const img = item.product?.imageUrls?.[0] || "/assets/layered-bottle.png";
                          return (
                            <div key={item.id} className="py-2 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                                  <Image src={img} alt={item.product?.title || "Product"} fill className="object-contain p-1" sizes="44px" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-sans font-medium text-xs text-gray-900 truncate">
                                    {item.product?.title || "Product"}
                                  </p>
                                  <span className="text-[11px] font-sans text-gray-500">
                                    Qty: <strong className="text-gray-800">{item.quantity}</strong> × ₹{item.price}
                                  </span>
                                </div>
                              </div>

                              <span className="font-sans font-bold text-xs text-gray-900 shrink-0">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dedicated Payment & Verification Card */}
                    <div>
                      <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                        Payment &amp; Transaction Details
                      </span>
                      
                      <TransactionVerificationBox
                        orderId={order.id}
                        orderNumber={order.orderNumber}
                        customerName={order.customerName}
                        customerPhone={order.customerPhone}
                        totalAmount={order.totalAmount}
                        paymentId={order.paymentId}
                        orderStatus={order.status}
                        paymentMethod={rawAddress.paymentMethod || order.paymentAttempts?.[0]?.method}
                        paymentAttempts={order.paymentAttempts}
                      />
                    </div>

                    {/* Order Payment Summary Bar */}
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 p-3.5 rounded-xl">
                      <div className="flex items-center gap-2 flex-wrap text-xs font-sans">
                        <span className="text-gray-500">Payment:</span>
                        <span className="font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px]">
                          {rawAddress.paymentMethod === "COD"
                            ? "Cash on Delivery"
                            : (rawAddress.paymentMethod === "RAZORPAY" || order.paymentAttempts?.[0]?.method === "RAZORPAY" || order.paymentId?.startsWith("pay_"))
                            ? "Razorpay Gateway"
                            : "Direct UPI"}
                        </span>

                        {hasCoupon && (
                          <Link
                            href={`/admin/orders?coupon=${encodeURIComponent(couponCode)}`}
                            className="font-bold px-2.5 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-900 text-[11px] border border-purple-300 transition-colors inline-flex items-center gap-1"
                          >
                            <Tag size={11} className="text-purple-700" />
                            <span>Coupon: {couponCode} (-₹{discountAmount})</span>
                          </Link>
                        )}

                        {rawAddress.screenshotUrl && (
                          <a
                            href={rawAddress.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-colors ml-1"
                            title="View Payment Screenshot"
                          >
                            <ExternalLink size={12} /> Screenshot
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-sans text-gray-600">Total Order Value:</span>
                        <span className="font-serif text-lg font-bold text-emerald-900">
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
