"use client";

import { Download } from "lucide-react";

interface ExportOrdersButtonProps {
  orders: any[];
}

export default function ExportOrdersButton({ orders }: ExportOrdersButtonProps) {
  const exportToCSV = () => {
    if (!orders || orders.length === 0) {
      alert("No orders available to export.");
      return;
    }

    const headers = [
      "Order Number",
      "Date",
      "Status",
      "Customer Name",
      "Phone",
      "Email",
      "Address",
      "City",
      "State",
      "PIN Code",
      "Items Count",
      "Items Details",
      "Total Amount (INR)",
      "Payment Method",
      "Courier",
      "Tracking Number"
    ];

    const rows = orders.map((o) => {
      const addr = o.shippingAddress || {};
      const itemsStr = (o.orderItems || [])
        .map((i: any) => `${i.quantity}x ${i.product?.title || "Product"} (Rs.${i.price})`)
        .join(" | ");

      return [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toLocaleDateString("en-IN")}"`,
        `"${o.status}"`,
        `"${(o.customerName || "").replace(/"/g, '""')}"`,
        `"${(o.customerPhone || "").replace(/"/g, '""')}"`,
        `"${(o.customerEmail || "").replace(/"/g, '""')}"`,
        `"${(addr.address || "").replace(/"/g, '""')}"`,
        `"${(addr.city || "").replace(/"/g, '""')}"`,
        `"${(addr.state || "").replace(/"/g, '""')}"`,
        `"${addr.pinCode || ""}"`,
        `"${(o.orderItems || []).length}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        `"${o.totalAmount}"`,
        `"${addr.paymentMethod || "PREPAID"}"`,
        `"${addr.courierName || ""}"`,
        `"${addr.trackingNumber || ""}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shynish_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportToCSV}
      type="button"
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-sans font-semibold hover:bg-gray-50 transition-colors shadow-xs"
      title="Export orders to CSV"
    >
      <Download size={13} />
      <span>Export CSV</span>
    </button>
  );
}
