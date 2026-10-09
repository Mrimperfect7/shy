import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import Image from "next/image";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-[var(--charcoal)]">Categories</h1>
        <Link 
          href="/admin/categories/new" 
          className="flex items-center gap-2 px-4 py-2 bg-[var(--forest)] text-white text-sm rounded-lg"
        >
          <Plus size={16} /> Add Category
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50/50 text-sm text-gray-500">
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Products</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {cat.imageUrl ? (
                      <div className="w-10 h-10 rounded-md overflow-hidden relative">
                        <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No Img</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-500">{cat.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">{cat._count.products}</td>
                <td className="p-4 flex justify-end gap-2">
                  <Link href={"/admin/categories/" + cat.id} className="p-2 text-gray-400 hover:text-[var(--forest)]">
                    <Edit size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
