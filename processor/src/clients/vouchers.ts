// copied over from https://github.com/voucherifyio/voucherify-js-sdk SdK seems to be poorly managed and not in par with API

import * as T from './types/vouchers';

import { encode } from './helpers';
import type { RequestController } from './voucherify-request-controller';

export class Vouchers {
  constructor(private client: RequestController) {}

  /**
   * @see https://docs.voucherify.io/reference/vouchers-get
   */
  public get(code: string) {
    return this.client.get<T.VouchersGetResponse>(`/vouchers/${encode(code)}`);
  }

  /**
   * @see https://docs.voucherify.io/reference/list-vouchers
   */
  public list(params: T.VouchersListParams = {}) {
    return this.client.get<T.VouchersListResponse>('/vouchers', params);
  }
}
