import { APIResponse } from '@playwright/test';
import { ApiClient } from './ApiClient';
import { CategoryRequest } from './schemas';

export class CategoriesApi extends ApiClient {
  async list(): Promise<APIResponse> {
    return this.request.get(this.url('/categories'), { headers: this.headers });
  }

  async tree(): Promise<APIResponse> {
    return this.request.get(this.url('/categories/tree'), { headers: this.headers });
  }

  async get(id: string): Promise<APIResponse> {
    return this.request.get(this.url(`/categories/tree/${id}`), { headers: this.headers });
  }

  async create(category: CategoryRequest): Promise<APIResponse> {
    return this.request.post(this.url('/categories'), { data: category, headers: this.headers });
  }

  async update(id: string, category: CategoryRequest): Promise<APIResponse> {
    return this.request.put(this.url(`/categories/${id}`), {
      data: category,
      headers: this.headers,
    });
  }

  async delete(id: string): Promise<APIResponse> {
    return this.request.delete(this.url(`/categories/${id}`), { headers: this.headers });
  }
}
