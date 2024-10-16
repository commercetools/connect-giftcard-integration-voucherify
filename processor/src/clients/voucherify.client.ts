import { VoucherifyServerSide } from '@voucherify/sdk';
import { config } from '../config/config';

type VoucherifyServerSideClient = ReturnType<typeof VoucherifyServerSide>;

export const VoucherifyAPI = (): VoucherifyServerSideClient => {
  const client = VoucherifyServerSide({
    applicationId: config.voucherifyApplicationId,
    secretKey: config.voucherifySecretKey,
  });

  return client;
};
