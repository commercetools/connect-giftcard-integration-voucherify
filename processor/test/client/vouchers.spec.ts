import { describe, test, expect, afterEach, afterAll, beforeEach, jest, beforeAll } from '@jest/globals';
import { voucherifyClient as client } from './client';
import { setupServer } from 'msw/node';
import { mockRequest } from './utils';
import { listVouchersOk } from './mock-response-data';

describe('Vouchers API', () => {
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

  describe('List Vouchers', () => {
    test('should return required properties', async () => {
      mockServer.use(mockRequest('https://api.voucherify.io', `/v1/vouchers`, 200, listVouchersOk));

      const query = {
        limit: 20,
        page: 1,
      };
      const response = await client.vouchers.list(query);
      expect(typeof response.vouchers).toBe('object');
      expect(typeof response.data_ref).toBe('string');
      expect(typeof response.object).toBe('string');
      expect(response.data_ref).toEqual('vouchers');
    });
  });
});

const resetTestLibs = () => {
  jest.resetAllMocks();
};
