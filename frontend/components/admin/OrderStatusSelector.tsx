"use client";

import { useState } from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/app/actions/admin-orders";
import { Loader2 } from "lucide-react";

export default function OrderStatusSelector({ 
  orderId, 
  currentStatus 
}: { 
  orderId: string; 
  currentStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setLoading(true);
    setStatus(newStatus);
    const res = await updateOrderStatusAction(orderId, newStatus);
    if (!res.success) {
      alert("Failed to update status: " + res.error);
      setStatus(currentStatus);
    }
    setLoading(false);
  };

  const getStatusColor = (st: OrderStatus) => {
    switch (st) {
      case "PAID":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "SHIPPED":
        return "bg-blue-50 text-blue-800 border-blue-300";
      case "DELIVERED":
        return "bg-green-100 text-green-900 border-green-400 font-bold";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default: // PENDING
        return "bg-amber-50 text-amber-800 border-amber-300";
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <select
        value={status}
        disabled={loading}
        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
        className={`text-xs font-sans font-medium px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer disabled:opacity-60 transition-colors shadow-sm ${getStatusColor(status)}`}
      >
        <option value="PENDING">🟡 Pending Verification</option>
        <option value="PAID">🟢 Payment Confirmed</option>
        <option value="SHIPPED">🚚 Shipped / In Transit</option>
        <option value="DELIVERED">✅ Delivered</option>
        <option value="CANCELLED">❌ Cancelled</option>
      </select>
      {loading && <Loader2 size={12} className="animate-spin text-gray-500" />}
    </div>
  );
}
