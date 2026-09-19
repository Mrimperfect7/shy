import prisma from "@/lib/prisma";
import EditProductForm from "./EditProductForm";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 h-full p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package size={32} className="text-gray-400" />
        </div>
        <h2 className="font-serif text-2xl" style={{ color: "var(--charcoal)" }}>Product Not Found</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">The product you are trying to edit does not exist or was deleted.</p>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-sans"
        >
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>
    );
  }

  return <EditProductForm product={product} />;
}
