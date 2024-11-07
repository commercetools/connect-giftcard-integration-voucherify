import { Cart, Payment } from '@commercetools/connect-payments-sdk';
import { randomUUID } from 'crypto';

export const getCartOK = () => {
  const cartId = randomUUID();
  const mockGetCartResult: Cart = {
    id: cartId,
    version: 1,
    lineItems: [],
    customLineItems: [],
    totalPrice: {
      type: 'centPrecision',
      currencyCode: 'USD',
      centAmount: 150000,
      fractionDigits: 2,
    },
    cartState: 'Ordered',
    origin: 'Customer',
    taxMode: 'ExternalAmount',
    taxRoundingMode: 'HalfEven',
    taxCalculationMode: 'LineItemLevel',
    shipping: [],
    discountCodes: [],
    directDiscounts: [],
    refusedGifts: [],
    itemShippingAddresses: [],
    inventoryMode: 'ReserveOnOrder',
    shippingMode: 'Single',
    shippingInfo: {
      shippingMethodName: 'shippingMethodName1',
      price: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 150000,
        fractionDigits: 2,
      },
      shippingRate: {
        price: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 1000,
          fractionDigits: 2,
        },
        tiers: [],
      },
      shippingMethodState: 'MatchesCart',
    },
    createdAt: '2024-01-01T00:00:00Z',
    lastModifiedAt: '2024-01-01T00:00:00Z',
  };
  return mockGetCartResult;
};

export const getPaymentResultOk: Payment = {
  id: '123456',
  version: 1,
  amountPlanned: {
    type: 'centPrecision',
    currencyCode: 'GBP',
    centAmount: 120000,
    fractionDigits: 2,
  },
  interfaceId: 'REDEMPTION_ID',
  paymentMethodInfo: {
    method: 'Debit Card',
    name: { 'en-US': 'Debit Card', 'en-GB': 'Debit Card' },
  },
  paymentStatus: { interfaceText: 'Paid' },
  transactions: [],
  interfaceInteractions: [],
  createdAt: '2024-02-13T00:00:00.000Z',
  lastModifiedAt: '2024-02-13T00:00:00.000Z',
};

export const updatePaymentResultOk: Payment = {
  id: '123456',
  version: 1,
  amountPlanned: {
    type: 'centPrecision',
    currencyCode: 'GBP',
    centAmount: 120000,
    fractionDigits: 2,
  },
  interfaceId: 'REDEMPTION_ID',
  paymentMethodInfo: {
    method: 'Debit Card',
    name: { 'en-US': 'Debit Card', 'en-GB': 'Debit Card' },
  },
  paymentStatus: { interfaceText: 'Paid' },
  transactions: [],
  interfaceInteractions: [],
  createdAt: '2024-02-13T00:00:00.000Z',
  lastModifiedAt: '2024-02-13T00:00:00.000Z',
};

export const createPaymentResultOk: Payment = {
  id: '24680',
  version: 1,
  createdAt: '2024-10-30T08:45:22.995Z',
  lastModifiedAt: '2024-10-30T08:45:22.995Z',
  lastModifiedBy: {
    clientId: 'dummy-ctp-client-id',
  },
  createdBy: {
    clientId: 'dummy-ctp-client-id',
  },
  interfaceId: 'REDEMPTION_ID',
  amountPlanned: {
    type: 'centPrecision',
    currencyCode: 'USD',
    centAmount: 1,
    fractionDigits: 2,
  },
  paymentMethodInfo: {
    paymentInterface: 'voucherify',
    method: 'giftcard',
  },
  paymentStatus: {},
  transactions: [
    {
      id: 'TXN_ID',
      type: 'Charge',
      amount: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 1,
        fractionDigits: 2,
      },
      interactionId: 'REDEMPTION_ID',
      state: 'Success',
    },
  ],
  interfaceInteractions: [],
  anonymousId: 'ANONYMOUS_ID',
};
