import { Errorx, ErrorxAdditionalOpts } from '@commercetools/connect-payments-sdk';

export type VoucherifyApiErrorData = {
  code: number;
  key: string;
  message: string;
  details?: string;
};

export class VoucherifyApiError extends Errorx {
  constructor(errorData: VoucherifyApiErrorData, additionalOpts?: ErrorxAdditionalOpts) {
    super({
      code: errorData.key,
      httpErrorStatus: errorData.code,
      message: errorData.message,
      skipLog: true,
      ...additionalOpts,
    });
  }
}

// `Currency of the gift card code - (${errorData.GiftCardCurrency}), does not match cart currency`
export class VoucherifyCustomError extends Errorx {
  constructor(errorData: VoucherifyApiErrorData, additionalOpts?: ErrorxAdditionalOpts) {
    super({
      code: errorData.key,
      httpErrorStatus: errorData.code,
      message: errorData.message,
      skipLog: true,
      ...additionalOpts,
    });
  }
}
