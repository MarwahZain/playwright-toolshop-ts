import { APIResponse } from '@playwright/test';
import { ApiClient } from './ApiClient';
import { ProductRequest } from './schemas';

export type ProductQuery = {
  page?: number;
  by_category?: string;
  by_brand?: string;
  sort?: string;
};

export class ProductsApi extends ApiClient {
  async list(query: ProductQuery = {}): Promise<APIResponse> {
    return this.request.get(this.url('/products'), { params: query, headers: this.headers });
  }

  async get(id: string): Promise<APIResponse> {
    return this.request.get(this.url(`/products/${id}`), { headers: this.headers });
  }

  async search(q: string): Promise<APIResponse> {
    return this.request.get(this.url('/products/search'), { params: { q }, headers: this.headers });
  }

  async create(product: ProductRequest): Promise<APIResponse> {
    return this.request.post(this.url('/products'), { data: product, headers: this.headers });
  }

  async update(id: string, product: ProductRequest): Promise<APIResponse> {
    return this.request.put(this.url(`/products/${id}`), { data: product, headers: this.headers });
  }

  async delete(id: string): Promise<APIResponse> {
    return this.request.delete(this.url(`/products/${id}`), { headers: this.headers });
  }
}
