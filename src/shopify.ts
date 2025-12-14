import dotenv from 'dotenv';

dotenv.config();

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';

if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
    console.error('Missing SHOPIFY_STORE_URL or SHOPIFY_ACCESS_TOKEN environment variables.');
    process.exit(1);
}

// Clean up URL to ensure it's just the domain or full URL
const cleanUrl = SHOPIFY_STORE_URL.replace(/\/$/, '');
const graphqlUrl = `${cleanUrl}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

export async function executeShopifyQuery(query: string, variables?: Record<string, any>) {
    try {
        const response = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN!,
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Shopify API Error (${response.status}): ${text}`);
        }

        const json = await response.json();

        if (json.errors) {
            throw new Error(`GraphQL Errors: ${JSON.stringify(json.errors)}`);
        }

        return json.data;
    } catch (error: any) {
        console.error('Error executing Shopify query:', error);
        throw error;
    }
}
