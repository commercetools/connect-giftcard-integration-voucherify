import { StackableRedeemableResultResponse } from '../../clients/types/stackable';
import { BalanceResponseSchemaDTO } from '../../dtos/voucherify-giftcards.dto';
import { VoucherifyApiError, VoucherifyCustomError } from '../../errors/voucherify-api.error';

export class BalanceConverter {
  public invalid(opts: StackableRedeemableResultResponse | undefined): BalanceResponseSchemaDTO {
    switch (opts?.error?.key) {
      case 'voucher_expired':
        throw new VoucherifyCustomError({
          message: opts.error?.details || 'Gift card is expired',
          code: 400,
          key: 'Expired',
        });
      case 'not_found':
        throw new VoucherifyCustomError({
          message: opts.error?.details || 'Resource not found',
          code: opts.error?.code || 400,
          key: 'NotFound',
        });
      default:
        throw new VoucherifyApiError(
          {
            message: opts?.error?.message || 'An error happened during this request',
            code: opts?.error?.code || 400,
            key: opts?.error?.key || 'GenericError',
          },
          {
            privateFields: {
              details: opts?.error?.details,
            },
          },
        );
    }
  }

  public valid(opts: StackableRedeemableResultResponse | undefined): BalanceResponseSchemaDTO {
    return {
      status: {
        state: 'Active',
      },
      amount: {
        centAmount: opts?.gift?.balance || 0,
        currencyCode: 'EUR', // Figure out best way to find and return the currency for this case. Maybe should be fetched from parent function and passed down as an argument in opts. This is application currency.
      },
    };
  }
}
