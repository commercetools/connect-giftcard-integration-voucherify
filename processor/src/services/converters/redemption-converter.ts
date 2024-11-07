import { RedemptionsRedeemStackableResponse } from '../../clients/types/redemptions';

import { RedeemResponseDTO } from '../../dtos/voucherify-giftcards.dto';

import { Payment } from '@commercetools/connect-payments-sdk';

export class RedemptionConverter {
  public convertVoucherifyResultCode(resultCode: string) {
    if (resultCode === 'SUCCESS') {
      return 'Success';
    } else if (resultCode === 'FAILURE') {
      return 'Failure';
    }
    return 'Initial';
  }

  public convert(opts: {
    redemptionResult: RedemptionsRedeemStackableResponse;
    createPaymentResult: Payment;
  }): RedeemResponseDTO {
    const redemptionResultObj = opts?.redemptionResult.redemptions[0];
    return {
      result: this.convertVoucherifyResultCode(redemptionResultObj?.result || ''),
      paymentId: opts?.createPaymentResult.id || '',
      redemptionId: redemptionResultObj?.id || '',
    };
  }
}
