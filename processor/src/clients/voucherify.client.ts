import { config } from '../config/config';
import { VoucherifyApiError } from '../errors/voucherify-api.error';
import { log } from '../libs/logger';
import { Voucherify } from './voucherify';

type IVoucherify = ReturnType<typeof Voucherify>;

// TODO: in the future let's try to keep log of the request duration to each external service
export const VoucherifyAPI = (): IVoucherify => {
  const client = Voucherify({
    applicationId: config.voucherifyApplicationId,
    secretKey: config.voucherifySecretKey,
    apiUrl: config.voucherifyApiURL,
  });

  return client;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const wrapVoucherifyError = (e: any): Error => {
  if (e?.key || e?.code) {
    return new VoucherifyApiError(
      {
        code: e?.code,
        key: e?.key,
        message: e?.message,
        details: e?.details,
      },
      { cause: e },
    );
  }

  log.error('Unexpected error calling Voucherify', e);
  return e;
};
