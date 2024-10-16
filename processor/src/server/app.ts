import { paymentSDK } from '../payment-sdk';
import { VoucherifyGiftCardService } from '../services/voucherify-giftcard.service';

const giftCardService = new VoucherifyGiftCardService({
  ctCartService: paymentSDK.ctCartService,
  ctPaymentService: paymentSDK.ctPaymentService,
  ctOrderService: paymentSDK.ctOrderService,
});

export const app = {
  services: {
    giftCardService,
  },
  hooks: {},
};
