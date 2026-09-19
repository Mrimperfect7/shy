import { shopifyAdminFetch } from "./client";

// Queries & Mutations

export const ADMIN_GET_PRODUCTS_QUERY = `
  query getProducts {
    products(first: 50, sortKey: TITLE) {
      edges {
        node {
          id
          title
          status
          totalInventory
          variants(first: 1) {
            edges {
              node {
                price
              }
            }
          }
          featuredMedia {
            preview {
              image {
                url
              }
            }
          }
        }
      }
    }
  }
`;

export const ADMIN_PRODUCT_CREATE_MUTATION = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADMIN_PRODUCT_UPDATE_MUTATION = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADMIN_PRODUCT_DELETE_MUTATION = `
  mutation productDelete($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

export const STAGED_UPLOADS_CREATE_MUTATION = `
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Helper Functions

export async function getAdminProducts() {
  const data = await shopifyAdminFetch<{ products: any }>({
    query: ADMIN_GET_PRODUCTS_QUERY
  });
  return data.products.edges.map((e: any) => e.node);
}

export async function createAdminProduct(input: {
  title: string;
  descriptionHtml: string;
  price: string;
  imageUrl?: string;
}) {
  const productInput: any = {
    title: input.title,
    descriptionHtml: input.descriptionHtml,
    status: "ACTIVE",
    variants: [
      {
        price: input.price
      }
    ]
  };

  if (input.imageUrl) {
    // If it's a staged upload URL or any public URL, attach it
    productInput.images = [{ src: input.imageUrl }];
  }

  const data = await shopifyAdminFetch<any>({
    query: ADMIN_PRODUCT_CREATE_MUTATION,
    variables: {
      input: productInput
    }
  });
  
  if (data.productCreate.userErrors.length > 0) {
    throw new Error(data.productCreate.userErrors[0].message);
  }
  return data.productCreate.product;
}

export async function deleteAdminProduct(id: string) {
  const data = await shopifyAdminFetch<any>({
    query: ADMIN_PRODUCT_DELETE_MUTATION,
    variables: { input: { id } }
  });

  if (data.productDelete.userErrors.length > 0) {
    throw new Error(data.productDelete.userErrors[0].message);
  }
  return data.productDelete.deletedProductId;
}

export async function getStagedUploadUrl(filename: string, mimeType: string) {
  const stagedData = await shopifyAdminFetch<any>({
    query: STAGED_UPLOADS_CREATE_MUTATION,
    variables: {
      input: [{
        filename,
        mimeType,
        resource: "IMAGE",
        httpMethod: "POST"
      }]
    }
  });

  if (stagedData.stagedUploadsCreate.userErrors.length > 0) {
    throw new Error(stagedData.stagedUploadsCreate.userErrors[0].message);
  }

  return stagedData.stagedUploadsCreate.stagedTargets[0];
}
