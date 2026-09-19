"use client";

import { useState } from "react";
import { updateInventoryAction } from "@/app/actions/admin-products";
import { Check, X } from "lucide-react";

export default function InventoryEditor({ productId, initialInventory }: { productId: string, initialInventory: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialInventory.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const num = parseInt(value);
    if (isNaN(num) || num < 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    setIsSaving(true);
    const res = await updateInventoryAction(productId, num);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert(res.error || "Failed to update inventory");
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setValue(initialInventory.toString());
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input 
          type="number"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--forest)]"
          disabled={isSaving}
          autoFocus
        />
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="p-1 text-green-600 hover:bg-green-50 rounded"
          title="Save"
        >
          <Check size={16} />
        </button>
        <button 
          onClick={handleCancel} 
          disabled={isSaving}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
          title="Cancel"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div 
      className="group flex items-center gap-2 cursor-pointer py-1 px-2 -ml-2 rounded hover:bg-gray-100 transition-colors w-fit"
      onClick={() => setIsEditing(true)}
      title="Click to edit stock"
    >
      <span className={initialInventory <= 5 ? "text-red-600 font-medium" : "text-gray-600"}>
        {initialInventory} in stock
      </span>
      <span className="text-[10px] uppercase font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
        Edit
      </span>
    </div>
  );
}
