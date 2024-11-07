import * as T from './types/redemptions';

import { encode, isObject, isString } from './helpers';
import type { RequestController } from './voucherify-request-controller';

export class Redemptions {
  constructor(private client: RequestController) {}

  public rollback(redemptionId: string, params?: T.RedemptionsRollbackParams) {
    let queryParams: T.RedemptionsRollbackQueryParams = {};
    let payload: T.RedemptionsRollbackPayload = {};

    if (isString(params)) {
      queryParams.reason = params;
    } else if (isObject(params)) {
      const { reason, tracking_id: trackingId, customer } = params;

      queryParams = {
        reason: reason ? reason : undefined,
        tracking_id: trackingId ? trackingId : undefined,
      };
      payload = { customer };
    }

    return this.client.post<T.RedemptionsRollbackResponse>(
      `/redemptions/${encode(redemptionId)}/rollback`,
      payload,
      queryParams,
    );
  }

  /**
   * @see https://docs.voucherify.io/reference/redeem-stacked-discounts
   */
  public redeemStackable(params: T.RedemptionsRedeemStackableParams) {
    return this.client.post<T.RedemptionsRedeemStackableResponse>(`/redemptions`, params);
  }
}
