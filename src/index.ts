import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { buildProductQuery, generateGraphQLQuery } from './queryBuilder';
import { executeShopifyQuery } from './shopify';
import { BuildQueryRequest, ExecuteQueryRequest, ProductFilters } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Documentation
app.get('/', (req, res) => {
    res.send(`
    <h1>Shopify MCP Server</h1>
    <p>Endpoints:</p>
    <ul>
      <li>POST /api/build-query</li>
      <li>POST /api/execute-query</li>
      <li>POST /api/products/search</li>
      <li>POST /api/orders/search</li>
    </ul>
  `);
});

// Endpoint: Build Query
app.post('/api/build-query', (req: Request<{}, {}, BuildQueryRequest>, res: Response) => {
    try {
        const { resource, filters, limit } = req.body;

        if (!resource || !filters) {
            return res.status(400).json({ error: 'Missing resource or filters' });
        }

        let searchString = '';
        if (resource === 'products') {
            searchString = buildProductQuery(filters);
        } else if (resource === 'orders') {
            // Implement order query builder if needed, for now simple pass through or error
            // For this MVP, we focus on products as per detailed requirements, but allow extension
            searchString = ''; // Placeholder
        }

        const query = generateGraphQLQuery(resource, limit || 50);
        const variables = { query: searchString };

        res.json({ query, variables });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint: Execute Query
app.post('/api/execute-query', async (req: Request<{}, {}, ExecuteQueryRequest>, res: Response) => {
    try {
        const { query, variables } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Missing query' });
        }

        const result = await executeShopifyQuery(query, variables);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint: Search Products (Shortcut)
app.post('/api/products/search', async (req: Request<{}, {}, { filters: ProductFilters; limit?: number }>, res: Response) => {
    try {
        const { filters, limit } = req.body;
        if (!filters) {
            return res.status(400).json({ error: 'Missing filters' });
        }

        const searchString = buildProductQuery(filters);
        const query = generateGraphQLQuery('products', limit || 50);
        const variables = { query: searchString };

        const result = await executeShopifyQuery(query, variables);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint: Search Orders (Shortcut)
app.post('/api/orders/search', async (req: Request, res: Response) => {
    // Placeholder for orders search
    try {
        const { query: searchString, limit } = req.body; // Expecting raw query string for orders for now or simple filters
        // For simplicity in this MVP, let's assume orders/search receives a raw query string or we can implement a builder later

        const gqlQuery = generateGraphQLQuery('orders', limit || 50);
        const variables = { query: searchString || "status:open" }; // Default to open orders

        const result = await executeShopifyQuery(gqlQuery, variables);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
