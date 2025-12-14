export interface ProductFilters {
    title?: string;
    status?: 'active' | 'draft' | 'archived';
    vendor?: string;
    productType?: string;
    tag?: string;
    sku?: string;
    price?: {
        min?: number;
        max?: number;
    };
}

export interface BuildQueryRequest {
    resource: 'products' | 'orders';
    filters: ProductFilters; // Extend for orders if needed
    limit?: number;
    sortBy?: string;
}

export interface BuildQueryResponse {
    query: string;
    variables: Record<string, any>;
}

export interface ExecuteQueryRequest {
    query: string;
    variables?: Record<string, any>;
}
