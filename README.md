# Shopify MCP Server

A specialized HTTP API designed to act as a middleware between n8n (or other automation tools) and Shopify's GraphQL API. It simplifies the construction of complex GraphQL search queries and executes them.

## Features

- **Query Builder**: Converts simple JSON filters into Shopify's GraphQL search syntax.
- **Execution Proxy**: Executes queries directly against Shopify using configured credentials.
- **Docker Ready**: Optimized for deployment on Coolify or any Docker environment.

## Endpoints

### 1. `POST /api/build-query`
Constructs a GraphQL query string and variables based on provided filters.

**Body:**
```json
{
  "resource": "products",
  "filters": {
    "title": "earring",
    "status": "active",
    "price": { "min": 10, "max": 50 }
  },
  "limit": 20
}
```

**Response:**
```json
{
  "query": "query SearchProducts...",
  "variables": { "query": "title:*earring* AND status:active AND variants.price:>=10 AND variants.price:<=50" }
}
```

### 2. `POST /api/execute-query`
Executes a raw GraphQL query against Shopify.

**Body:**
```json
{
  "query": "query { shop { name } }",
  "variables": {}
}
```

### 3. `POST /api/products/search`
Combines build and execute for products.

**Body:**
```json
{
  "filters": {
    "title": "necklace",
    "vendor": "MyBrand"
  },
  "limit": 10
}
```

### 4. `POST /api/orders/search`
Search for orders.

**Body:**
```json
{
  "query": "status:open",
  "limit": 10
}
```

## Setup & Deployment

### Environment Variables
Create a `.env` file (see `.env.example`):
```
PORT=3000
SHOPIFY_STORE_URL=https://your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_your_admin_access_token
SHOPIFY_API_VERSION=2024-10
```

### Local Development
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Docker / Coolify Deployment
1. Build the image:
   ```bash
   docker build -t shopify-mcp-server .
   ```
2. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env shopify-mcp-server
   ```

On Coolify, simply point to this repository (or upload the code) and set the environment variables in the Coolify dashboard.
#