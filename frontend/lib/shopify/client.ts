// Shopify Storefront API GraphQL Client
// This file is SERVER-SIDE ONLY - never import in client components

const SHOPIFY_STOREFRONT_API_URL = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${process.env.SHOPIFY_API_VERSION || '2024-10'}/graphql.json`

export interface ShopifyError {
  message: string
  locations?: { line: number; column: number }[]
  path?: string[]
  extensions?: Record<string, unknown>
}

export interface ShopifyResponse<T> {
  data: T
  errors?: ShopifyError[]
}

export async function shopifyFetch<T>({
  query,
  variables,
  cache = 'force-cache',
  tags,
}: {
  query: string
  variables?: Record<string, unknown>
  cache?: RequestCache
  tags?: string[]
}): Promise<T> {
  const endpoint = SHOPIFY_STOREFRONT_API_URL
  const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

  if (!key) {
    console.warn("SHOPIFY_STOREFRONT_ACCESS_TOKEN is not configured. Returning empty data.");
    return { products: { edges: [] }, product: null, collection: null, collections: { edges: [] }, cart: null } as any;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': key,
    },
    body: JSON.stringify({ query, variables }),
    cache,
    ...(tags ? { next: { tags } } : {}),
  })

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`)
  }

  const json: ShopifyResponse<T> = await res.json()

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('\n'))
  }

  return json.data
}

// Shopify Admin API Client (server-side only)
const SHOPIFY_ADMIN_API_URL = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION || '2024-10'}/graphql.json`

export async function shopifyAdminFetch<T>({
  query,
  variables,
}: {
  query: string
  variables?: Record<string, unknown>
}): Promise<T> {
  const key = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN

  if (!key) {
    throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN is not configured')
  }

  const res = await fetch(SHOPIFY_ADMIN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': key,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Shopify Admin API error: ${res.status} ${res.statusText}`)
  }

  const json: ShopifyResponse<T> = await res.json()

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('\n'))
  }

  return json.data
}
