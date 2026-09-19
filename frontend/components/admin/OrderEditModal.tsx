"use client";

import { useState } from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderDetailsAction } from "@/app/actions/admin-orders";
import { 
  X, 
  Edit3, 
  Truck, 
  Printer, 
  MapPin, 
  Phone, 
  Mail, 
  Save, 
  Loader2, 
  CheckCircle2, 
  FileText,
  Copy,
  ShieldCheck,
  Check
} from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";

interface OrderEditModalProps {
  order: any;
}

export default function OrderEditModal({ order }: OrderEditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState(false);

  const rawAddress = order.shippingAddress || {};

  const [customerName, setCustomerName] = useState(order.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone || "");
  const [customerEmail, setCustomerEmail] = useState(order.customerEmail || "");
  const [address, setAddress] = useState(rawAddress.address || "");
  const [city, setCity] = useState(rawAddress.city || "");
  const [state, setState] = useState(rawAddress.state || "");
  const [pinCode, setPinCode] = useState(rawAddress.pinCode || "");
  const [courierName, setCourierName] = useState(rawAddress.courierName || "India Post");
  const [trackingNumber, setTrackingNumber] = useState(rawAddress.trackingNumber || "");
  const [adminNotes, setAdminNotes] = useState(rawAddress.adminNotes || "");
  const [status, setStatus] = useState<OrderStatus>(order.status || "PENDING");
  const [transactionId, setTransactionId] = useState(order.paymentId || "");

  const cleanPhone = (customerPhone || "").replace(/\D/g, "");

  const copyUtr = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(false);

    const res = await updateOrderDetailsAction(order.id, {
      customerName,
      customerPhone,
      customerEmail,
      address,
      city,
      state,
      pinCode,
      courierName,
      trackingNumber,
      adminNotes,
      status,
      transactionId,
    });

    if (res.success) {
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } else {
      alert("Failed to update order: " + res.error);
    }
    setLoading(false);
  };

  const handlePrintPackingSlip = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const itemsHtml = (order.orderItems || []).map((i: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.product?.title || "SHYN.ISH Product"}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${i.price}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${i.price * i.quantity}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Packing Slip - ${order.orderNumber}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1a1a1a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #C5A059; padding-bottom: 16px; margin-bottom: 20px; }
            .brand { font-size: 24px; font-weight: bold; color: #141312; }
            .badge { background: #fefce8; color: #854d0e; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
            .box { background: #fafafa; border: 1px solid #e5e5e5; padding: 12px; border-radius: 6px; }
            .box-title { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
            th { text-align: left; background: #f5f5f5; padding: 8px; border-bottom: 2px solid #ddd; }
            .total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 16px; color: #141312; }
            .footer { margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 12px; font-size: 11px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">SHYN.ISH</div>
              <div style="font-size: 12px; color: #666;">Everyday Shine. Effortless Style. 18K PVD Gold Jewellery</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: bold;">PACKING SLIP</div>
              <div style="font-mono; font-size: 13px; margin-top: 4px;">#${order.orderNumber}</div>
              <div style="font-size: 11px; color: #888;">${new Date(order.createdAt).toLocaleDateString("en-IN")}</div>
            </div>
          </div>

          <div class="grid">
            <div class="box">
              <div class="box-title">Deliver To:</div>
              <div style="font-weight: bold; font-size: 14px;">${customerName}</div>
              <div style="font-size: 12px; margin-top: 4px; line-height: 1.4;">${address}</div>
              <div style="font-size: 12px;">${city}, ${state} - <strong>${pinCode}</strong></div>
              <div style="font-size: 12px; margin-top: 6px;">Phone: <strong>${customerPhone}</strong></div>
            </div>

            <div class="box">
              <div class="box-title">Order Information:</div>
              <div style="font-size: 12px;">Payment: <strong>${rawAddress.paymentMethod === "COD" ? "Cash on Delivery" : "Prepaid UPI"}</strong></div>
              <div style="font-size: 12px; margin-top: 4px;">Status: <span class="badge">${status}</span></div>
              <div style="font-size: 12px; margin-top: 4px;">Courier: <strong>${courierName}</strong></div>
              ${trackingNumber ? `<div style="font-size: 12px; margin-top: 4px;">Tracking: <strong>${trackingNumber}</strong></div>` : ''}
              ${transactionId ? `<div style="font-size: 12px; margin-top: 4px;">UPI UTR: <strong>${transactionId}</strong></div>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total">Total Order Value: ₹${order.totalAmount}</div>

          <div class="footer">
            Thank you for choosing SHYN.ISH. Everyday shine, effortless style. For support: care@shynish.com
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getWhatsAppTrackingMsg = () => {
    return encodeURIComponent(
      `Hello ${customerName}! ✨ Your order *#${order.orderNumber}* from SHYN.ISH has been packed and handed over to *${courierName}* for delivery to ${city}.\n\n📦 *Tracking / AWB Number:* ${trackingNumber || "Pending Update"}\n\nTrack your shipment or reach us here for any assistance.`
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-sans font-semibold transition-colors cursor-pointer"
        title="Edit Order, Address & Tracking"
      >
        <Edit3 size={13} />
        <span>Edit / Details</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-gray-900 bg-white px-2.5 py-1 rounded border border-gray-300">
                  {order.orderNumber}
                </span>
                <span className="text-xs font-sans text-gray-500">Edit Order &amp; Delivery Details</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintPackingSlip}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-sans font-semibold transition-colors"
                  title="Print Packing Slip"
                >
                  <Printer size={13} /> Slip
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
              
              {/* Status & Payment Verification Section */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-sans font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck size={15} />
                  <span>Order Status &amp; UPI Verification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-sans font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Order Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-sans font-semibold focus:outline-none focus:border-forest"
                    >
                      <option value="PENDING">🟡 PENDING (Awaiting Verification)</option>
                      <option value="PAID">🟢 PAID (Payment Confirmed)</option>
                      <option value="SHIPPED">🚚 SHIPPED (In Transit)</option>
                      <option value="DELIVERED">✅ DELIVERED</option>
                      <option value="CANCELLED">❌ CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Payment Method &amp; Reference ID
                    </label>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-sans font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {rawAddress.paymentMethod === "COD" 
                            ? "Cash on Delivery" 
                            : (rawAddress.paymentMethod === "RAZORPAY" || transactionId.startsWith("pay_"))
                            ? "Razorpay Gateway"
                            : "Direct UPI"}
                        </span>
                        {rawAddress.couponCode && (
                          <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                            Coupon: {rawAddress.couponCode} (-₹{rawAddress.discountAmount || 0})
                          </span>
                        )}
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. pay_xxx or 423456789012"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-sans font-mono"
                        />
                        {transactionId && (
                          <button
                            type="button"
                            onClick={() => copyUtr(transactionId)}
                            className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs cursor-pointer"
                            title="Copy Payment ID"
                          >
                            {copiedUtr ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Contact Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-sans font-bold text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-sans font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-sans"
                  />
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-sans font-bold text-gray-700 mb-1">Street Address &amp; Landmark</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-sans"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-sans font-bold text-gray-700 mb-1">City / Town</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-bold text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-bold text-gray-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-sans font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Courier & Tracking Section */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-sans font-bold text-xs uppercase tracking-wider">
                  <Truck size={14} />
                  <span>Courier &amp; Tracking Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-sans font-medium text-gray-700 mb-1">Courier Partner</label>
                    <select
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-sans"
                    >
                      <option value="India Post">India Post Speed Post</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="DTDC">DTDC</option>
                      <option value="Blue Dart">Blue Dart</option>
                      <option value="Shadowfax">Shadowfax</option>
                      <option value="Xpressbees">Xpressbees</option>
                      <option value="ST Courier">ST Courier</option>
                      <option value="Professional Courier">The Professional Couriers</option>
                      <option value="Other">Other Courier</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-medium text-gray-700 mb-1">Tracking Number / AWB #</label>
                    <input
                      type="text"
                      placeholder="e.g. IN123456789"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-sans font-mono"
                    />
                  </div>
                </div>

                {cleanPhone.length >= 10 && (
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/91${cleanPhone.slice(-10)}?text=${getWhatsAppTrackingMsg()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-sans text-xs font-semibold shadow-xs transition-colors"
                    >
                      <WhatsAppIcon size={12} fill="#fff" />
                      <span>Send WhatsApp Tracking to Customer</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Admin Internal Notes */}
              <div>
                <label className="block text-xs font-sans font-bold text-gray-700 mb-1">Internal Admin Notes</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or internal notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-sans"
                />
              </div>

              {/* Footer Save Actions */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                {successMsg ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-sans font-bold">
                    <CheckCircle2 size={14} /> Changes Saved Successfully!
                  </span>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-sans font-semibold transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--forest)] text-white text-xs font-sans font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    <span>Save Order Changes</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
