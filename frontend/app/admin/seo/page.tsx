import { Metadata } from "next";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Edit, AlertCircle, CheckCircle2 } from "lucide-react";
import { calculateSeoScore } from "@/lib/seo";

export const metadata: Metadata = {
  title: "SEO Management",
};

export const dynamic = "force-dynamic";

export default async function SeoDashboardPage() {
  let products: any[] = [];
  let categories: any[] = [];
  let seoMetadata: any[] = [];

  try {
    const res = await Promise.all([
      prisma.product.findMany({ select: { slug: true, title: true, status: true } }),
      prisma.category.findMany({ select: { slug: true, name: true } }),
      prisma.seoMetadata.findMany(),
    ]);
    products = res[0];
    categories = res[1];
    seoMetadata = res[2];
  } catch (e) {
    console.error("Error fetching SEO dashboard data:", e);
  }

  const activeProducts = products.filter((p) => p.status === "ACTIVE");
  
  let productsWithSeo = 0;
  let categoriesWithSeo = 0;
  let missingDescriptions = 0;
  let missingTitles = 0;
  let totalScore = 0;
  let scoredItems = 0;

  const seoItems = [
    ...activeProducts.map((p) => ({ type: "PRODUCT", id: p.slug, name: p.title })),
    ...categories.map((c) => ({ type: "CATEGORY", id: c.slug, name: c.name })),
    { type: "PAGE", id: "home", name: "Homepage" },
    { type: "PAGE", id: "about", name: "About Us" },
    { type: "PAGE", id: "contact", name: "Contact" },
  ];

  seoItems.forEach((item) => {
    const seo = seoMetadata.find((s) => s.entityType === item.type && s.entityId === item.id);
    if (seo) {
      if (item.type === "PRODUCT") productsWithSeo++;
      if (item.type === "CATEGORY") categoriesWithSeo++;
      if (!seo.description) missingDescriptions++;
      if (!seo.title) missingTitles++;

      const score = calculateSeoScore(seo.title, seo.description, seo.canonicalUrl, !!seo.ogImage);
      totalScore += score;
      scoredItems++;
    } else {
      missingDescriptions++;
      missingTitles++;
    }
  });

  const averageScore = scoredItems > 0 ? Math.round(totalScore / scoredItems) : 0;
  const totalIndexable = seoMetadata.filter((s) => s.robotsIndex).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">SEO & Marketing</h1>
          <p className="text-sm text-gray-500 mt-1">Manage metadata and search visibility</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Overall SEO Score</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{averageScore} / 100</p>
          <div className="mt-2 text-xs text-gray-500">Based on active metadata</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Indexable Pages</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalIndexable || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Products with SEO</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{productsWithSeo} / {activeProducts.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Categories with SEO</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{categoriesWithSeo} / {categories.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Issues Detected</h3>
          <ul className="space-y-3">
            <li className="flex items-center text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
              {missingTitles} pages missing SEO Title
            </li>
            <li className="flex items-center text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
              {missingDescriptions} pages missing Meta Description
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Content List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Score</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {seoItems.map((item) => {
                const seo = seoMetadata.find((s) => s.entityType === item.type && s.entityId === item.id);
                const score = seo ? calculateSeoScore(seo.title, seo.description, seo.canonicalUrl, !!seo.ogImage) : 0;
                return (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {seo ? (
                        <span className="inline-flex items-center text-emerald-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-600">
                          <AlertCircle className="h-4 w-4 mr-1" /> Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div className={`h-1.5 rounded-full ${score > 80 ? 'bg-emerald-500' : score > 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">{score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/seo/edit?type=${item.type}&id=${item.id}`} className="text-primary-600 hover:text-primary-700">
                        <Edit className="h-4 w-4 inline" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
