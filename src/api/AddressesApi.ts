import { APIResponse } from '@playwright/test';
import { ApiClient } from './ApiClient';

export class AddressesApi extends ApiClient {
  /** The address the shop fills in for a country, postal code and house number. */
  async postcodeLookup(
    country: string,
    postcode: string,
    houseNumber: string,
  ): Promise<APIResponse> {
    return this.request.get(this.url('/postcode-lookup'), {
      params: { country, postcode, house_number: houseNumber },
    });
  }
}
