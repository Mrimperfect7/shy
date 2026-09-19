import Link from "next/link";
import { Plus, Package, Edit } from "lucide-react";
import Image from "next/image";
import prisma from "@/lib/prisma";

import InventoryEditor from "@/components/admin/InventoryEditor";
import ProductDeleteButton from "@/components/admin/ProductDeleteButton";

// Force dynamic rendering so build passes without env vars
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--charcoal)" }}>Products</h1>
          <p className="font-sans text-sm text-gray-500">Manage your store's product catalog directly.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md transition-opacity hover:opacity-90"
          style={{ background: "var(--charcoal)" }}
        >
          <Plus size={16} />
          <span>Add Product</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border flex flex-col flex-1 overflow-hidden" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
        
        {/* Table */}
        <div className="overflow-x-auto flex-1">
          {products.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package size={32} className="text-gray-400" />
              </div>
              <h3 className="font-serif text-lg mb-1" style={{ color: "var(--charcoal)" }}>No products found</h3>
              <p className="text-sm text-gray-500 max-w-md">Your catalog is empty. Add a product to get started.</p>
            </div>
          ) : (
            <table className="w-full text-left font-sans text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b sticky top-0 z-10" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-500">Product</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Inventory</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(26,26,26,0.05)" }}>
                {products.map((product) => {
                  const price = product.price.toFixed(2);
                  const imageUrl = product.imageUrls[0] || "https://placehold.co/100x100/png?text=No+Image";
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/admin/products/${product.id}`} className="flex items-center gap-4 group">
                          <div className="w-12 h-12 rounded-md bg-gray-100 overflow-hidden relative border border-gray-200 shrink-0">
                            <Image src={imageUrl} alt={product.title} fill className="object-cover" />
                          </div>
                          <span className="font-medium text-gray-900 group-hover:text-forest transition-colors truncate max-w-xs md:max-w-md whitespace-nowrap overflow-hidden" title={product.title}>
                            {product.title}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        {product.status === "ACTIVE" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            {product.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <InventoryEditor productId={product.id} initialInventory={product.inventory} />
                      </td>
                      <td className="px-6 py-4 font-medium" style={{ color: "var(--forest-green)" }}>
                        ₹{price}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
                            title="Edit Product"
                          >
                            <Edit size={16} />
                          </Link>
                          <ProductDeleteButton productId={product.id} productTitle={product.title} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
