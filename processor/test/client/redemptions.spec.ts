import { describe, test, expect, afterEach, afterAll, beforeEach, jest, beforeAll } from '@jest/globals';
import { voucherifyClient as client } from './client';
import { setupServer } from 'msw/node';
import { mockRequest } from '../mocks/utils';
import { rollbackVouchersRedemptionOk } from '../mocks/voucherify';
import { randomUUID } from 'crypto';

describe('Redemptions API', () => {
  const mockServer = setupServer();

  beforeAll(() => {
    mockServer.listen({
      onUnhandledRequest: 'bypass',
    });
  });

  beforeEach(() => {
    jest.setTimeout(10000);
    resetTestLibs();
  });

  afterEach(() => {
    mockServer.resetHandlers();
  });

  afterAll(() => {
    mockServer.close();
  });

  describe('rollback voucher redemption', () => {
    test('should return required properties', async () => {
      const redemptionId = randomUUID();
      mockServer.use(
        mockRequest(
          'https://api.voucherify.io',
          `/v1/redemptions/${redemptionId}/rollback`,
          200,
          rollbackVouchersRedemptionOk,
        ),
      );

      const response = await client.redemptions.rollback(redemptionId);
      expect(response.result).toBe('SUCCESS');
      expect(response.id).toBeDefined();
      expect(response.object).toBe('redemption_rollback');
    });

    test('should return required properties-with reason', async () => {
      const redemptionId = randomUUID();
      const reason = {
        reason: 'Malfunctioned goods',
      };
      mockServer.use(
        mockRequest(
          'https://api.voucherify.io',
          `/v1/redemptions/${redemptionId}/rollback`,
          200,
          rollbackVouchersRedemptionOk,
        ),
      );

      const response = await client.redemptions.rollback(redemptionId, reason);
      expect(response.result).toBe('SUCCESS');
      expect(response.id).toBeDefined();
      expect(response.object).toBe('redemption_rollback');
    });
  });
});

const resetTestLibs = () => {
  jest.resetAllMocks();
};
