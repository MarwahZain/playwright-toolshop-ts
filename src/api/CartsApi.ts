import { APIResponse } from '@playwright/test';
import { ApiClient } from './ApiClient';

export class CartsApi extends ApiClient {
  async create(): Promise<APIResponse> {
    return this.request.post(this.url('/carts'), { headers: this.headers });
  }

  async get(cartId: string): Promise<APIResponse> {
    return this.request.get(this.url(`/carts/${cartId}`), { headers: this.headers });
  }

  async addItem(cartId: string, productId: string, quantity = 1): Promise<APIResponse> {
    return this.request.post(this.url(`/carts/${cartId}`), {
      data: { product_id: productId, quantity },
      headers: this.headers,
    });
  }

  async removeItem(cartId: string, productId: string): Promise<APIResponse> {
    return this.request.delete(this.url(`/carts/${cartId}/product/${productId}`), {
      headers: this.headers,
    });
  }

  async delete(cartId: string): Promise<APIResponse> {
    return this.request.delete(this.url(`/carts/${cartId}`), { headers: this.headers });
  }
}
