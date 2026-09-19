import { shopifyFetch } from './client'
import {
  CUSTOMER_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
  CUSTOMER_UPDATE_MUTATION,
  CUSTOMER_ADDRESS_CREATE_MUTATION,
  CUSTOMER_ADDRESS_UPDATE_MUTATION,
  CUSTOMER_ADDRESS_DELETE_MUTATION,
  CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
  CUSTOMER_RECOVER_MUTATION,
} from './mutations'
import { GET_CUSTOMER_QUERY } from './queries'
import type { ShopifyCustomer } from './types'

export interface CustomerCreateInput {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  acceptsMarketing?: boolean
}

export interface CustomerUserError {
  field: string[] | null
  message: string
  code: string
}

// ─── Customer Operations ──────────────────────────────────────────────────────

export async function createCustomer(input: CustomerCreateInput): Promise<{
  customer: { id: string; email: string } | null
  errors: CustomerUserError[]
}> {
  try {
    const data = await shopifyFetch<{
      customerCreate: {
        customer: { id: string; email: string; firstName: string; lastName: string } | null
        customerUserErrors: CustomerUserError[]
      }
    }>({
      query: CUSTOMER_CREATE_MUTATION,
      variables: { input },
      cache: 'no-store',
    })

    return {
      customer: data.customerCreate.customer,
      errors: data.customerCreate.customerUserErrors,
    }
  } catch (err) {
    console.error('createCustomer error:', err)
    return { customer: null, errors: [{ field: null, message: 'Registration failed', code: 'UNKNOWN' }] }
  }
}

export async function getCustomerAccessToken(
  email: string,
  password: string
): Promise<{
  accessToken: string | null
  expiresAt: string | null
  errors: CustomerUserError[]
}> {
  try {
    const data = await shopifyFetch<{
      customerAccessTokenCreate: {
        customerAccessToken: { accessToken: string; expiresAt: string } | null
        customerUserErrors: CustomerUserError[]
      }
    }>({
      query: CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
      variables: { input: { email, password } },
      cache: 'no-store',
    })

    return {
      accessToken: data.customerAccessTokenCreate.customerAccessToken?.accessToken ?? null,
      expiresAt: data.customerAccessTokenCreate.customerAccessToken?.expiresAt ?? null,
      errors: data.customerAccessTokenCreate.customerUserErrors,
    }
  } catch (err) {
    console.error('getCustomerAccessToken error:', err)
    return { accessToken: null, expiresAt: null, errors: [{ field: null, message: 'Login failed', code: 'UNKNOWN' }] }
  }
}

export async function deleteCustomerAccessToken(
  accessToken: string
): Promise<boolean> {
  try {
    await shopifyFetch<{
      customerAccessTokenDelete: {
        deletedAccessToken: string | null
        userErrors: { field: string[]; message: string }[]
      }
    }>({
      query: CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
      variables: { customerAccessToken: accessToken },
      cache: 'no-store',
    })
    return true
  } catch (err) {
    console.error('deleteCustomerAccessToken error:', err)
    return false
  }
}

export async function recoverCustomerPassword(email: string): Promise<{ success: boolean; errors: CustomerUserError[] }> {
  try {
    const data = await shopifyFetch<{
      customerRecover: {
        customerUserErrors: CustomerUserError[]
      }
    }>({
      query: CUSTOMER_RECOVER_MUTATION,
      variables: { email },
      cache: 'no-store',
    })

    return {
      success: data.customerRecover?.customerUserErrors?.length === 0,
      errors: data.customerRecover?.customerUserErrors || [],
    }
  } catch (err) {
    console.error('recoverCustomerPassword error:', err)
    return { success: false, errors: [{ field: null, message: 'Password recovery failed', code: 'UNKNOWN' }] }
  }
}

export async function getCustomer(
  customerAccessToken: string
): Promise<ShopifyCustomer | null> {
  try {
    const data = await shopifyFetch<{ customer: ShopifyCustomer | null }>({
      query: GET_CUSTOMER_QUERY,
      variables: { customerAccessToken },
      cache: 'no-store',
    })

    return data.customer
  } catch (err) {
    console.error('getCustomer error:', err)
    return null
  }
}

export async function updateCustomer(
  accessToken: string,
  updates: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    password?: string
    acceptsMarketing?: boolean
  }
): Promise<{ success: boolean; errors: CustomerUserError[] }> {
  try {
    const data = await shopifyFetch<{
      customerUpdate: {
        customer: { id: string } | null
        customerUserErrors: CustomerUserError[]
      }
    }>({
      query: CUSTOMER_UPDATE_MUTATION,
      variables: { customerAccessToken: accessToken, customer: updates },
      cache: 'no-store',
    })

    return {
      success: !!data.customerUpdate.customer,
      errors: data.customerUpdate.customerUserErrors,
    }
  } catch (err) {
    console.error('updateCustomer error:', err)
    return { success: false, errors: [{ field: null, message: 'Update failed', code: 'UNKNOWN' }] }
  }
}

export async function createCustomerAddress(
  accessToken: string,
  address: {
    firstName?: string
    lastName?: string
    address1: string
    address2?: string
    city: string
    province?: string
    country: string
    zip: string
    phone?: string
  }
): Promise<{ success: boolean; errors: { field: string[]; message: string }[] }> {
  try {
    const data = await shopifyFetch<{
      customerAddressCreate: {
        customerAddress: { id: string } | null
        customerUserErrors: { field: string[]; message: string }[]
      }
    }>({
      query: CUSTOMER_ADDRESS_CREATE_MUTATION,
      variables: { customerAccessToken: accessToken, address },
      cache: 'no-store',
    })

    return {
      success: !!data.customerAddressCreate.customerAddress,
      errors: data.customerAddressCreate.customerUserErrors,
    }
  } catch (err) {
    console.error('createCustomerAddress error:', err)
    return { success: false, errors: [{ field: [], message: 'Failed to add address' }] }
  }
}

export async function deleteCustomerAddress(
  accessToken: string,
  addressId: string
): Promise<boolean> {
  try {
    await shopifyFetch<{
      customerAddressDelete: { deletedCustomerAddressId: string | null }
    }>({
      query: CUSTOMER_ADDRESS_DELETE_MUTATION,
      variables: { customerAccessToken: accessToken, id: addressId },
      cache: 'no-store',
    })
    return true
  } catch (err) {
    console.error('deleteCustomerAddress error:', err)
    return false
  }
}

export async function setDefaultCustomerAddress(
  accessToken: string,
  addressId: string
): Promise<boolean> {
  try {
    await shopifyFetch<{
      customerDefaultAddressUpdate: { customer: { id: string } | null }
    }>({
      query: CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
      variables: { customerAccessToken: accessToken, addressId },
      cache: 'no-store',
    })
    return true
  } catch (err) {
    console.error('setDefaultCustomerAddress error:', err)
    return false
  }
}
