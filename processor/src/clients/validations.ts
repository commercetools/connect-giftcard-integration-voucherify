// copied over from https://github.com/voucherifyio/voucherify-js-sdk SdK seems to be poorly managed and not in par with API

import * as T from './types/validations';

import type { RequestController } from './voucherify-request-controller';

export class Validations {
  constructor(private client: RequestController) {}

  /**
   * @see https://docs.voucherify.io/reference/validate-stacked-discounts-1
   */
  public validateStackable(params: T.ValidationsValidateStackableParams) {
    return this.client.post<T.ValidationValidateStackableResponse>(`/validations`, params);
  }
}
