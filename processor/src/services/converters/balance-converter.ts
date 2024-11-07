import { StackableRedeemableResultResponse } from '../../clients/types/stackable';
import { getConfig } from '../../config/config';
import { BalanceResponseSchemaDTO } from '../../dtos/voucherify-giftcards.dto';
import { VoucherifyApiError, VoucherifyCustomError } from '../../errors/voucherify-api.error';

export class BalanceConverter {
  public invalid(opts: StackableRedeemableResultResponse | undefined): BalanceResponseSchemaDTO {
    switch (opts?.error?.key) {
      // HINT: chose to use `.details` here because it contains more information
      case 'voucher_expired':
        throw new VoucherifyCustomError({
          message: opts.error?.details || 'Gift card is expired',
          code: 400,
          key: 'Expired',
        });
      case 'not_found':
        throw new VoucherifyCustomError({
          message: opts.error?.details || 'Resource not found',
          code: opts.error?.code || 404,
          key: 'NotFound',
        });
      default:
        throw new VoucherifyApiError(
          {
            message: opts?.error?.message || 'An error happened during this requests',
            code: opts?.error?.code || 400,
            key: 'GenericError',
          },
          {
            privateFields: {
              ...opts?.details,
            },
          },
        );
    }
  }

  public valid(opts: StackableRedeemableResultResponse | undefined): BalanceResponseSchemaDTO {
    return {
      status: {
        state: 'Valid',
      },
      amount: {
        centAmount: opts?.gift?.balance || 0,
        currencyCode: getConfig().voucherifyCurrency,
      },
    };
  }
}
