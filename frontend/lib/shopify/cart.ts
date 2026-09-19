import { shopifyFetch } from './client'
import {
  CREATE_CART_MUTATION,
  ADD_CART_LINES_MUTATION,
  UPDATE_CART_LINES_MUTATION,
  REMOVE_CART_LINES_MUTATION,
  APPLY_DISCOUNT_CODES_MUTATION,
  REMOVE_DISCOUNT_CODES_MUTATION,
} from './mutations'
import { GET_CART_QUERY } from './queries'
import type { ShopifyCart, NormalizedCart, NormalizedCartLine } from './types'

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeCart(cart: ShopifyCart): NormalizedCart {
  const lines: NormalizedCartLine[] = cart.lines.edges.map(({ node }) => ({
    id: node.id,
    quantity: node.quantity,
    totalAmount: node.cost.totalAmount.amount,
    amountPerQuantity: node.cost.amountPerQuantity.amount,
    compareAtAmountPerQuantity: node.cost.compareAtAmountPerQuantity?.amount ?? null,
    currencyCode: node.cost.totalAmount.currencyCode,
    variantId: node.merchandise.id,
    variantTitle: node.merchandise.title,
    selectedOptions: node.merchandise.selectedOptions,
    price: node.merchandise.price.amount,
    compareAtPrice: node.merchandise.compareAtPrice?.amount ?? null,
    image: node.merchandise.image,
    productId: node.merchandise.product.id,
    productTitle: node.merchandise.product.title,
    productHandle: node.merchandise.product.handle,
  }))

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    discountCodes: cart.discountCodes,
    lines,
    subtotal: cart.cost.subtotalAmount.amount,
    total: cart.cost.totalAmount.amount,
    totalTax: cart.cost.totalTaxAmount?.amount ?? null,
    currencyCode: cart.cost.subtotalAmount.currencyCode,
  }
}

// ─── Cart Operations ──────────────────────────────────────────────────────────

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[] = [],
  discountCodes: string[] = []
): Promise<{ id: string; checkoutUrl: string } | null> {
  try {
    const data = await shopifyFetch<{
      cartCreate: {
        cart: { id: string; checkoutUrl: string; totalQuantity: number } | null
        userErrors: { field: string[]; message: string }[]
      }
    }>({
      query: CREATE_CART_MUTATION,
      variables: { lines, discountCodes },
      cache: 'no-store',
    })

    if (data.cartCreate.userErrors.length > 0) {
      console.error('Cart create errors:', data.cartCreate.userErrors)
      return null
    }

    return data.cartCreate.cart
  } catch (err) {
    console.error('createCart error:', err)
    return null
  }
}

export async function getCart(cartId: string): Promise<NormalizedCart | null> {
  try {
    const data = await shopifyFetch<{ cart: ShopifyCart | null }>({
      query: GET_CART_QUERY,
      variables: { cartId },
      cache: 'no-store',
    })

    return data.cart ? normalizeCart(data.cart) : null
  } catch (err) {
    console.error('getCart error:', err)
    return null
  }
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<NormalizedCart | null> {
  try {
    const data = await shopifyFetch<{
      cartLinesAdd: {
        cart: ShopifyCart | null
        userErrors: { field: string[]; message: string }[]
      }
    }>({
      query: ADD_CART_LINES_MUTATION,
      variables: { cartId, lines },
      cache: 'no-store',
    })

    if (data.cartLinesAdd.userErrors.length > 0) {
      console.error('Add cart lines errors:', data.cartLinesAdd.userErrors)
    }

    // Re-fetch full cart after adding
    return await getCart(cartId)
  } catch (err) {
    console.error('addCartLines error:', err)
    return null
  }
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<NormalizedCart | null> {
  try {
    await shopifyFetch<{
      cartLinesUpdate: {
        cart: { id: string } | null
        userErrors: { field: string[]; message: string }[]
      }
    }>({
      query: UPDATE_CART_LINES_MUTATION,
      variables: { cartId, lines },
      cache: 'no-store',
    })

    return await getCart(cartId)
  } catch (err) {
    console.error('updateCartLines error:', err)
    return null
  }
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<NormalizedCart | null> {
  try {
    await shopifyFetch<{
      cartLinesRemove: {
        cart: { id: string } | null
        userErrors: { field: string[]; message: string }[]
      }
    }>({
      query: REMOVE_CART_LINES_MUTATION,
      variables: { cartId, lineIds },
      cache: 'no-store',
    })

    return await getCart(cartId)
  } catch (err) {
    console.error('removeCartLines error:', err)
    return null
  }
}

export async function applyDiscountCodes(
  cartId: string,
  discountCodes: string[]
): Promise<{ cart: NormalizedCart | null; applicable: boolean }> {
  try {
    const data = await shopifyFetch<{
      cartDiscountCodesUpdate: {
        cart: ShopifyCart | null
        userErrors: { field: string[]; message: string }[]
      }
    }>({
      query: APPLY_DISCOUNT_CODES_MUTATION,
      variables: { cartId, discountCodes },
      cache: 'no-store',
    })

    const cart = data.cartDiscountCodesUpdate.cart
    if (!cart) return { cart: null, applicable: false }

    const normalized = await getCart(cartId)
    const applicable = cart.discountCodes.some(
      (dc) => dc.code === discountCodes[0] && dc.applicable
    )

    return { cart: normalized, applicable }
  } catch (err) {
    console.error('applyDiscountCodes error:', err)
    return { cart: null, applicable: false }
  }
}

export async function removeDiscountCodes(
  cartId: string
): Promise<NormalizedCart | null> {
  try {
    await shopifyFetch<{
      cartDiscountCodesUpdate: {
        cart: { id: string } | null
        userErrors: { field: string[]; message: string }[]
      }
    }>({
      query: REMOVE_DISCOUNT_CODES_MUTATION,
      variables: { cartId },
      cache: 'no-store',
    })

    return await getCart(cartId)
  } catch (err) {
    console.error('removeDiscountCodes error:', err)
    return null
  }
}
