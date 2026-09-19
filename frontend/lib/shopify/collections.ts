import { shopifyFetch } from "./client";
import { GET_COLLECTIONS_QUERY, GET_COLLECTION_BY_HANDLE_QUERY } from "./queries";
import type { NormalizedProduct } from "./types";

function normalizeProduct(product: any): NormalizedProduct {
  return {
    ...product,
    images: product.images?.edges?.map((e: any) => e.node) || [],
    variants: product.variants?.edges?.map((e: any) => e.node) || [],
  };
}

export async function getCollection(handle: string, first = 12) {
  try {
    const data = await shopifyFetch<any>({
      query: GET_COLLECTION_BY_HANDLE_QUERY,
      variables: { handle, first },
    });
    
    if (!data.collection) return null;
    
    return {
      ...data.collection,
      products: data.collection.products?.edges?.map((edge: any) => normalizeProduct(edge.node)) || [],
    };
  } catch (err) {
    return null;
  }
}

export async function getCollections(first = 10) {
  try {
    const data = await shopifyFetch<any>({
      query: GET_COLLECTIONS_QUERY,
      variables: { first },
    });
    
    return data.collections?.edges?.map((edge: any) => edge.node) || [];
  } catch (err) {
    return [];
  }
}
