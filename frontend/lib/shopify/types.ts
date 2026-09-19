// Shopify TypeScript Types

export interface ShopifyImage {
  id?: string
  url: string
  altText: string | null
  width: number
  height: number
}

export interface ShopifyPrice {
  amount: string
  currencyCode: string
}

export interface ShopifyVariant {
  id: string
  title: string
  availableForSale: boolean
  quantityAvailable: number | null
  price: ShopifyPrice
  compareAtPrice: ShopifyPrice | null
  selectedOptions: { name: string; value: string }[]
  image: ShopifyImage | null
}

export interface ShopifyOption {
  id: string
  name: string
  values: string[]
}

export interface ShopifyMetafield {
  key: string
  namespace: string
  value: string
  type: string
}

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  availableForSale: boolean
  productType: string
  vendor: string
  tags: string[]
  createdAt: string
  updatedAt: string
  priceRange: {
    minVariantPrice: ShopifyPrice
    maxVariantPrice: ShopifyPrice
  }
  compareAtPriceRange: {
    minVariantPrice: ShopifyPrice
  }
  images: { edges: { node: ShopifyImage }[] }
  variants: { edges: { node: ShopifyVariant }[] }
  options: ShopifyOption[]
  seo: { title: string | null; description: string | null }
  metafields: (ShopifyMetafield | null)[]
}

export interface ShopifyCollection {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml?: string
  image: ShopifyImage | null
  seo: { title: string | null; description: string | null }
  products?: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
    edges: { cursor: string; node: ShopifyProduct }[]
  }
}

export interface ShopifyCartLine {
  id: string
  quantity: number
  cost: {
    totalAmount: ShopifyPrice
    amountPerQuantity: ShopifyPrice
    compareAtAmountPerQuantity: ShopifyPrice | null
  }
  merchandise: {
    id: string
    title: string
    availableForSale: boolean
    quantityAvailable: number | null
    selectedOptions: { name: string; value: string }[]
    price: ShopifyPrice
    compareAtPrice: ShopifyPrice | null
    image: ShopifyImage | null
    product: {
      id: string
      title: string
      handle: string
      images: { edges: { node: { url: string; altText: string | null } }[] }
    }
  }
}

export interface ShopifyCart {
  id: string
  checkoutUrl: string
  createdAt: string
  updatedAt: string
  totalQuantity: number
  discountCodes: { code: string; applicable: boolean }[]
  lines: { edges: { node: ShopifyCartLine }[] }
  cost: {
    subtotalAmount: ShopifyPrice
    totalAmount: ShopifyPrice
    totalTaxAmount: ShopifyPrice | null
    totalDutyAmount: ShopifyPrice | null
  }
}

export interface ShopifyAddress {
  id: string
  firstName: string | null
  lastName: string | null
  address1: string | null
  address2: string | null
  city: string | null
  province: string | null
  country: string | null
  zip: string | null
  phone: string | null
}

export interface ShopifyOrder {
  id: string
  name: string
  orderNumber: number
  processedAt: string
  financialStatus: string
  fulfillmentStatus: string
  currentTotalPrice: ShopifyPrice
  lineItems: {
    edges: {
      node: {
        title: string
        quantity: number
        variant: {
          price: ShopifyPrice
          image: ShopifyImage | null
        } | null
      }
    }[]
  }
}

export interface ShopifyCustomer {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
  defaultAddress: ShopifyAddress | null
  addresses: { edges: { node: ShopifyAddress }[] }
  orders: { edges: { node: ShopifyOrder }[] }
}

// Normalized types (flattened from Shopify edge/node pattern)
export interface NormalizedProduct {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  availableForSale: boolean
  productType: string
  vendor: string
  tags: string[]
  price: string
  maxPrice: string
  compareAtPrice: string | null
  currencyCode: string
  images: ShopifyImage[]
  variants: ShopifyVariant[]
  options: ShopifyOption[]
  seo: { title: string | null; description: string | null }
  metafields: Record<string, string>
}

export interface NormalizedCartLine {
  id: string
  quantity: number
  totalAmount: string
  amountPerQuantity: string
  compareAtAmountPerQuantity: string | null
  currencyCode: string
  variantId: string
  variantTitle: string
  selectedOptions: { name: string; value: string }[]
  price: string
  compareAtPrice: string | null
  image: ShopifyImage | null
  productId: string
  productTitle: string
  productHandle: string
}

export interface NormalizedCart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  discountCodes: { code: string; applicable: boolean }[]
  lines: NormalizedCartLine[]
  subtotal: string
  total: string
  totalTax: string | null
  currencyCode: string
}

// Webhook types
export interface ShopifyWebhookOrder {
  id: number
  name: string
  email: string
  total_price: string
  subtotal_price: string
  total_discounts: string
  currency: string
  financial_status: string
  discount_codes: {
    code: string
    amount: string
    type: string
  }[]
  line_items: {
    id: number
    title: string
    quantity: number
    price: string
    variant_id: number
  }[]
  refunds?: {
    id: number
    refund_line_items: { quantity: number; line_item_id: number }[]
  }[]
}
