import { shopifyFetch } from "./client";
import { GET_PRODUCTS_QUERY, GET_PRODUCT_BY_HANDLE_QUERY } from "./queries";
import type { NormalizedProduct } from "./types";


export function formatPrice(amount: string | number, currencyCode: string = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

function normalizeProduct(product: any): NormalizedProduct {
  return {
    ...product,
    images: product.images?.edges?.map((e: any) => e.node) || [],
    variants: product.variants?.edges?.map((e: any) => e.node) || [],
  };
}

interface GetProductsOptions {
  first?: number;
  query?: string;
  sortKey?: string;
  reverse?: boolean;
  after?: string;
}

export async function getProducts({
  first = 12,
  query = "",
  sortKey = "RELEVANCE",
  reverse = false,
  after,
}: GetProductsOptions = {}): Promise<{ products: NormalizedProduct[]; pageInfo: any }> {
  const data = await shopifyFetch<any>({
    query: GET_PRODUCTS_QUERY,
    variables: { first, query, sortKey, reverse, after },
  });

  const products = (data as any).products.edges.map((edge: any) => normalizeProduct(edge.node));
  return { products, pageInfo: (data as any).products.pageInfo };
}

export async function getProduct(handle: string): Promise<NormalizedProduct | null> {
  try {
    const data = await shopifyFetch<any>({
      query: GET_PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
    });
    if (!data.product) return null;
    return normalizeProduct(data.product);
  } catch (err) {
    return null;
  }
}
