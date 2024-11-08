import {
  AuthorityAuthorizationHook,
  JWTAuthenticationHook,
  Oauth2AuthenticationHook,
  SessionHeaderAuthenticationHook,
} from '@commercetools/connect-payments-sdk';
import { Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  PaymentIntentRequestSchema,
  PaymentIntentRequestSchemaDTO,
  PaymentIntentResponseSchema,
  PaymentIntentResponseSchemaDTO,
} from '../dtos/operations/payment-intents.dto';
import { StatusResponseSchema, StatusResponseSchemaDTO } from '../dtos/operations/status.dto';
import { AbstractGiftCardService } from '../services/abstract-giftcard.service';

type OperationRouteOptions = {
  sessionHeaderAuthHook: SessionHeaderAuthenticationHook;
  oauth2AuthHook: Oauth2AuthenticationHook;
  jwtAuthHook: JWTAuthenticationHook;
  authorizationHook: AuthorityAuthorizationHook;
  giftCardService: AbstractGiftCardService;
};

export const operationsRoute = async (fastify: FastifyInstance, opts: FastifyPluginOptions & OperationRouteOptions) => {
  fastify.get<{ Reply: StatusResponseSchemaDTO }>(
    '/status',
    {
      preHandler: [opts.jwtAuthHook.authenticate()],
      schema: {
        response: {
          200: StatusResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const status = await opts.giftCardService.status();
      reply.code(200).send(status);
    },
  );

  fastify.post<{ Body: PaymentIntentRequestSchemaDTO; Reply: PaymentIntentResponseSchemaDTO; Params: { id: string } }>(
    '/payment-intents/:id',
    {
      preHandler: [
        opts.oauth2AuthHook.authenticate(),
        opts.authorizationHook.authorize('manage_project', 'manage_checkout_payment_intents'),
      ],
      schema: {
        params: {
          type: 'object',
          properties: {
            id: Type.String(),
          },
          required: ['id'],
        },
        body: PaymentIntentRequestSchema,
        response: {
          200: PaymentIntentResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const resp = await opts.giftCardService.modifyPayment({
        paymentId: id,
        data: request.body,
      });

      return reply.status(200).send(resp);
    },
  );
};
