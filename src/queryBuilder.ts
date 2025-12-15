import { ProductFilters } from './types';

export function buildProductQuery(filters: ProductFilters): string {
  const parts: string[] = [];

  if (filters.title) {
    parts.push(`title:*${filters.title}*`);
  }

  // Default to 'active' status unless specifically overridden
  if (filters.status) {
    parts.push(`status:${filters.status}`);
  } else {
    parts.push('status:active');
  }

  if (filters.vendor) {
    // Handle spaces in vendor name by quoting
    const vendor = filters.vendor.includes(' ') ? `'${filters.vendor}'` : filters.vendor;
    parts.push(`vendor:${vendor}`);
  }

  if (filters.productType) {
    const pType = filters.productType.includes(' ') ? `'${filters.productType}'` : filters.productType;
    parts.push(`product_type:${pType}`);
  }

  if (filters.tag) {
    parts.push(`tag:${filters.tag}`);
  }

  // SKU search is often done via 'sku:value' or 'variants.sku:value' depending on exact need.
  // Shopify search syntax for products usually supports 'sku:' directly or via general query.
  if (filters.sku) {
    parts.push(`sku:${filters.sku}`);
  }

  if (filters.price) {
    if (filters.price.min !== undefined) {
      parts.push(`variants.price:>=${filters.price.min}`);
    }
    if (filters.price.max !== undefined) {
      parts.push(`variants.price:<=${filters.price.max}`);
    }
  }

  return parts.join(' AND ');
}

export function generateGraphQLQuery(resource: 'products' | 'orders', limit: number = 50): string {
  if (resource === 'products') {
    return `
query SearchProducts($query: String!, $first: Int!) {
  products(first: $first, query: $query) {
    edges {
      node {
        id
        title
        handle
        onlineStoreUrl
        status
        vendor
        productType
        tags
        createdAt
        updatedAt
        publishedAt
        images(first: 1) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              sku
              price
              inventoryQuantity
              compareAtPrice
            }
          }
        }
      }
    }
  }
}
    `.trim();
  }

  // Basic Orders query placeholder
  if (resource === 'orders') {
    return `
query SearchOrders($query: String!, $first: Int!) {
  orders(first: $first, query: $query) {
    edges {
      node {
        id
        name
        customer {
          firstName
          lastName
          displayName
          email
          phone
        }
        createdAt
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        displayFulfillmentStatus
      }
    }
  }
}
    `.trim();
  }

  throw new Error(`Unsupported resource: ${resource}`);
}
