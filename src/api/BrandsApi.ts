import { APIResponse } from '@playwright/test';
import { ApiClient } from './ApiClient';
import { BrandRequest } from './schemas';

export class BrandsApi extends ApiClient {
  async list(): Promise<APIResponse> {
    return this.request.get(this.url('/brands'), { headers: this.headers });
  }

  async get(id: string): Promise<APIResponse> {
    return this.request.get(this.url(`/brands/${id}`), { headers: this.headers });
  }

  async create(brand: BrandRequest): Promise<APIResponse> {
    return this.request.post(this.url('/brands'), { data: brand, headers: this.headers });
  }

  async update(id: string, brand: BrandRequest): Promise<APIResponse> {
    return this.request.put(this.url(`/brands/${id}`), { data: brand, headers: this.headers });
  }

  async delete(id: string): Promise<APIResponse> {
    return this.request.delete(this.url(`/brands/${id}`), { headers: this.headers });
  }
}
