// Shopify Storefront GraphQL Queries

export const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    title
    handle
    description
    descriptionHtml
    availableForSale
    productType
    vendor
    tags
    createdAt
    updatedAt
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      edges {
        node {
          id
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          quantityAvailable
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
    options {
      id
      name
      values
    }
    seo {
      title
      description
    }
    metafields(identifiers: [
      { namespace: "custom", key: "benefits" },
      { namespace: "custom", key: "ingredients" },
      { namespace: "custom", key: "how_to_use" },
    ]) {
      key
      namespace
      value
      type
    }
  }
`

export const GET_PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          ...ProductFragment
        }
      }
    }
  }
`

export const GET_PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFragment
    }
  }
`

export const GET_COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
            width
            height
          }
          seo {
            title
            description
          }
        }
      }
    }
  }
`

export const GET_COLLECTION_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetCollectionByHandle($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      image {
        url
        altText
        width
        height
      }
      seo {
        title
        description
      }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          cursor
          node {
            ...ProductFragment
          }
        }
      }
    }
  }
`

export const SEARCH_PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query SearchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          ...ProductFragment
        }
      }
    }
  }
`

export const GET_CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      createdAt
      updatedAt
      totalQuantity
      discountCodes {
        code
        applicable
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
              amountPerQuantity {
                amount
                currencyCode
              }
              compareAtAmountPerQuantity {
                amount
                currencyCode
              }
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                availableForSale
                quantityAvailable
                selectedOptions {
                  name
                  value
                }
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                  width
                  height
                }
                product {
                  id
                  title
                  handle
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
        totalAmount {
          amount
          currencyCode
        }
        totalTaxAmount {
          amount
          currencyCode
        }
        totalDutyAmount {
          amount
          currencyCode
        }
      }
    }
  }
`

export const GET_CUSTOMER_QUERY = `
  query GetCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        province
        country
        zip
        phone
      }
      addresses(first: 10) {
        edges {
          node {
            id
            firstName
            lastName
            address1
            address2
            city
            province
            country
            zip
            phone
          }
        }
      }
      orders(first: 20) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            currentTotalPrice {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    price {
                      amount
                      currencyCode
                    }
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
