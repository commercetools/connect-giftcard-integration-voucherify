import { FastifyInstance } from 'fastify';
import { paymentSDK } from '../../payment-sdk';
import { voucherifyGiftCardServiceRoutes } from '../../routes/voucherify-giftcard.route';
import { app } from '../app';

export default async function (server: FastifyInstance) {
  await server.register(voucherifyGiftCardServiceRoutes, {
    giftCardService: app.services.giftCardService,
    sessionHeaderAuthHook: paymentSDK.sessionHeaderAuthHookFn,
    sessionQueryParamAuthHook: paymentSDK.sessionQueryParamAuthHookFn,
  });
}
