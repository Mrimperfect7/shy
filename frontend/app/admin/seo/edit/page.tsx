import prisma from "@/lib/prisma";
import SeoEditForm from "./SeoEditForm";
import { notFound } from "next/navigation";
import { getSeoMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function SeoEditPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; id?: string }>;
}) {
  const { type, id } = await searchParams;

  if (!type || !id) {
    return notFound();
  }

  // Fetch existing SEO metadata
  const seo = await getSeoMetadata(type, id);
  
  // Verify entity exists
  let entityName = id;
  let entityUrl = "";
  
  if (type === "PRODUCT") {
    const product = await prisma.product.findUnique({ where: { slug: id } });
    if (!product) return notFound();
    entityName = product.title;
    entityUrl = `/products/${id}`;
  } else if (type === "CATEGORY") {
    const category = await prisma.category.findUnique({ where: { slug: id } });
    if (!category) return notFound();
    entityName = category.name;
    entityUrl = `/collections/${id}`;
  } else if (type === "PAGE") {
    entityUrl = id === "home" ? "/" : `/${id}`;
    entityName = id.charAt(0).toUpperCase() + id.slice(1);
  } else {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Edit SEO Metadata</h1>
        <p className="text-sm text-gray-500 mt-1">Editing metadata for {entityName} ({type})</p>
      </div>
      
      <SeoEditForm 
        entityType={type} 
        entityId={id} 
        entityName={entityName}
        entityUrl={entityUrl}
        initialData={seo} 
      />
    </div>
  );
}
