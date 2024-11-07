import {
  SessionHeaderAuthenticationHook,
  SessionQueryParamAuthenticationHook,
} from '@commercetools/connect-payments-sdk';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { VoucherifyGiftCardService } from '../services/voucherify-giftcard.service';
import { BalanceResponseSchema, BalanceResponseSchemaDTO } from '../dtos/voucherify-giftcards.dto';
import { Type } from '@sinclair/typebox';

type RoutesOptions = {
  giftCardService: VoucherifyGiftCardService;
  sessionHeaderAuthHook: SessionHeaderAuthenticationHook;
  sessionQueryParamAuthHook: SessionQueryParamAuthenticationHook;
};

export const voucherifyGiftCardServiceRoutes = async (
  fastify: FastifyInstance,

  opts: FastifyPluginOptions & RoutesOptions,
) => {
  fastify.get<{ Reply: BalanceResponseSchemaDTO | void; Params: { code: string } }>(
    '/balance/:code',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        params: {
          type: 'object',
          properties: {
            code: Type.String(),
          },
        },
        response: {
          200: BalanceResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const res = await opts.giftCardService.balance(request.params.code);
      return reply.status(200).send(res);
    },
  );
};
