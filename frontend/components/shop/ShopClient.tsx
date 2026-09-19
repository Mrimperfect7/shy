"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { label: "Featured", value: "" },
  { label: "Price: Low to High", value: "PRICE_ASC" },
  { label: "Price: High to Low", value: "PRICE_DESC" },
  { label: "Newest First", value: "CREATED_AT_DESC" },
];

const PRODUCTS_PER_PAGE = 24;

export default function ShopClient({ initialProducts }: { initialProducts: any[] }) {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "";
  const q = searchParams.get("q") || "";
  const pageStr = searchParams.get("page") || "1";
  
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    let filtered = [...initialProducts];
    
    if (q) {
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q.toLowerCase()));
    }

    if (sort === "PRICE_ASC") {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sort === "PRICE_DESC") {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sort === "CREATED_AT_DESC") {
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    setProducts(filtered);
  }, [sort, q, initialProducts]);

  const currentPage = Math.max(1, parseInt(pageStr) || 1);
  const totalCount = products.length;
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  const skip = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(skip, skip + PRODUCTS_PER_PAGE);

  const startItem = totalCount === 0 ? 0 : skip + 1;
  const endItem = Math.min(skip + PRODUCTS_PER_PAGE, totalCount);

  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("page", targetPage.toString());
    const queryString = params.toString();
    return `/shop${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <>
      {/* Filters bar */}
      <div className="flex items-center justify-between py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 btn-outline py-2 px-4 text-xs lg:hidden">
            <SlidersHorizontal size={13} /> Filters
          </button>
          <p className="text-xs font-sans" style={{ color: "var(--text-muted)" }}>
            {totalCount > 0 ? `Showing ${startItem}–${endItem} of ${totalCount} products` : "0 products"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs font-sans hidden sm:block" style={{ color: "var(--text-muted)" }}>Sort by</label>
          <div className="flex gap-2 overflow-x-auto snap-x scrollbar-hide py-2">
              {SORT_OPTIONS.map(o => {
                const params = new URLSearchParams();
                if (o.value) params.set("sort", o.value);
                if (q) params.set("q", q);
                const href = `/shop${params.toString() ? `?${params.toString()}` : ''}`;
                
                return (
                  <Link 
                    key={o.value} 
                    href={href}
                    className={`px-3 py-1.5 text-xs rounded-full border whitespace-nowrap snap-center transition-colors ${sort === o.value ? 'bg-forest text-white border-forest' : 'bg-white border-gray-200 text-charcoal hover:border-gray-300'}`}
                  >
                    {o.label}
                  </Link>
                );
              })}
          </div>
        </div>
      </div>

      <div className="py-10">
        {currentProducts.length === 0 ? (
          <div className="text-center py-12 lg:py-24">
            <p className="font-serif text-2xl mb-3" style={{ color: "var(--charcoal)" }}>No products found</p>
            <p className="text-sm font-sans" style={{ color: "var(--text-muted)" }}>
              Check back soon for new arrivals
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {currentProducts.map((p, i) => <ProductCard key={p.id} product={p as any} priority={i < 4} />)}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-14 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-sans text-gray-500">
                  Page {currentPage} of {totalPages} ({totalCount} total items)
                </p>

                <nav aria-label="Shop pagination" className="flex items-center gap-1.5">
                  {currentPage > 1 ? (
                    <Link
                      href={createPageUrl(currentPage - 1)}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-medium font-sans rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      <ChevronLeft size={14} /> Previous
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-2 text-xs font-medium font-sans rounded-lg border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed">
                      <ChevronLeft size={14} /> Previous
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        const isActive = pageNum === currentPage;
                        return (
                          <Link
                            key={pageNum}
                            href={createPageUrl(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center text-xs font-sans font-medium rounded-lg transition-colors ${
                              isActive
                                ? "bg-[var(--forest)] text-white shadow-xs font-bold"
                                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                            }`}
                          >
                            {pageNum}
                          </Link>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <span key={pageNum} className="px-1 text-xs text-gray-400 font-sans">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {currentPage < totalPages ? (
                    <Link
                      href={createPageUrl(currentPage + 1)}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-medium font-sans rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      Next <ChevronRight size={14} />
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-2 text-xs font-medium font-sans rounded-lg border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed">
                      Next <ChevronRight size={14} />
                    </span>
                  )}
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
