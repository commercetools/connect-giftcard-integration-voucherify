import { ValidationValidateStackableResponse } from '../../clients/types/validations';

import { getConfig } from '../../config/config';
import { BalanceResponseSchemaDTO } from '../../dtos/voucherify-giftcards.dto';
import { VoucherifyCustomError } from '../../errors/voucherify-api.error';

export class BalanceConverter {
  public convert(opts: ValidationValidateStackableResponse | undefined): BalanceResponseSchemaDTO {
    const result = opts?.redeemables?.[0].result;

    if (opts?.valid) {
      return {
        status: {
          state: 'Valid',
        },
        amount: {
          centAmount: result?.gift?.balance || 0,
          currencyCode: getConfig().voucherifyCurrency,
        },
      };
    }

    switch (result?.error?.key) {
      // HINT: chose to use `.details` here because it contains more information

      case 'voucher_expired':
        throw new VoucherifyCustomError({
          message: result.error?.details || 'Gift card is expired',
          code: 400,
          key: 'Expired',
        });
      case 'not_found':
        throw new VoucherifyCustomError({
          message: result.error?.details || 'Resource not found',
          code: result.error?.code || 404,
          key: 'NotFound',
        });
      default:
        throw new VoucherifyCustomError(
          {
            message: result?.error?.message || 'An error happened during this requests',
            code: result?.error?.code || 400,
            key: result?.error?.key || 'GenericError',
          },
          {
            privateFields: {
              ...result?.details,
            },
          },
        );
    }
  }
}
