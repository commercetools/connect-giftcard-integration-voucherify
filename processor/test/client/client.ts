import { Voucherify } from '../../src/clients/voucherify';
import 'dotenv/config';
const getVoucherifyClient = () => {
  const applicationId = 'test-application-id',
    secretKey = 'test-secret-key',
    apiUrl = (process.env.API_URL as string) || `https://api.voucherify.io`;

  return Voucherify({
    applicationId,
    secretKey,
    apiUrl,
  });
};

export const voucherifyClient = getVoucherifyClient();
