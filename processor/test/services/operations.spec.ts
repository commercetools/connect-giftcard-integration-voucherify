import fastify from 'fastify';
import { describe, beforeAll, afterAll, test, expect, jest, afterEach } from '@jest/globals';
import {
  AuthorityAuthorizationHook,
  AuthorityAuthorizationManager,
  CommercetoolsCartService,
  CommercetoolsOrderService,
  CommercetoolsPaymentService,
  ContextProvider,
  JWTAuthenticationHook,
  JWTAuthenticationManager,
  Logger,
  Oauth2AuthenticationHook,
  Oauth2AuthenticationManager,
  RequestContextData,
  SessionHeaderAuthenticationHook,
  SessionHeaderAuthenticationManager,
} from '@commercetools/connect-payments-sdk';
import { IncomingHttpHeaders } from 'node:http';
import { operationsRoute } from '../../src/routes/operation.route';
import { VoucherifyGiftCardService } from '../../src/services/voucherify-giftcard.service';

describe('/operations APIs', () => {
  const app = fastify({ logger: false });
  const token = 'token';
  const jwtToken = 'jwtToken';
  const logger = jest.fn() as unknown as Logger;

  const spyAuthenticateJWT = jest
    .spyOn(JWTAuthenticationHook.prototype, 'authenticate')
    .mockImplementationOnce(() => async (request: { headers: IncomingHttpHeaders }) => {
      expect(request.headers['authorization']).toContain(`Bearer ${jwtToken}`);
    });

  const spyAuthenticateOauth2 = jest
    .spyOn(Oauth2AuthenticationHook.prototype, 'authenticate')
    .mockImplementationOnce(() => async (request: { headers: IncomingHttpHeaders }) => {
      expect(request.headers['authorization']).toContain(`Bearer ${token}`);
    });

  const spyAuthenticateSession = jest
    .spyOn(SessionHeaderAuthenticationHook.prototype, 'authenticate')
    .mockImplementationOnce(() => async (request: { headers: IncomingHttpHeaders }) => {
      expect(request.headers['x-session-id']).toContain('session-id');
    });

  const spiedJwtAuthenticationHook = new JWTAuthenticationHook({
    authenticationManager: jest.fn() as unknown as JWTAuthenticationManager,
    contextProvider: jest.fn() as unknown as ContextProvider<RequestContextData>,
    logger,
  });

  const spiedOauth2AuthenticationHook = new Oauth2AuthenticationHook({
    authenticationManager: jest.fn() as unknown as Oauth2AuthenticationManager,
    contextProvider: jest.fn() as unknown as ContextProvider<RequestContextData>,
    logger,
  });

  const spiedSessionHeaderAuthenticationHook = new SessionHeaderAuthenticationHook({
    authenticationManager: jest.fn() as unknown as SessionHeaderAuthenticationManager,
    contextProvider: jest.fn() as unknown as ContextProvider<RequestContextData>,
    logger,
  });

  const spiedAuthorityAuthorizationHook = new AuthorityAuthorizationHook({
    authorizationManager: jest.fn() as unknown as AuthorityAuthorizationManager,
    contextProvider: jest.fn() as unknown as ContextProvider<RequestContextData>,
    logger,
  });

  const spiedGiftCardService = new VoucherifyGiftCardService({
    ctCartService: jest.fn() as unknown as CommercetoolsCartService,
    ctPaymentService: jest.fn() as unknown as CommercetoolsPaymentService,
    ctOrderService: jest.fn() as unknown as CommercetoolsOrderService,
  });

  beforeAll(async () => {
    await app.register(operationsRoute, {
      prefix: '/operations',
      oauth2AuthHook: spiedOauth2AuthenticationHook,
      jwtAuthHook: spiedJwtAuthenticationHook,
      sessionHeaderAuthHook: spiedSessionHeaderAuthenticationHook,
      authorizationHook: spiedAuthorityAuthorizationHook,
      giftCardService: spiedGiftCardService,
    });
  });

  afterEach(async () => {
    spyAuthenticateJWT.mockClear();
    spyAuthenticateOauth2.mockClear();
    spyAuthenticateSession.mockClear();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /operations/status', () => {
    test('it should return the status of the connector', async () => {
      //Given
      jest.spyOn(spiedGiftCardService, 'status').mockResolvedValue({
        metadata: {
          name: 'giftcard-integration-voucherify',
          description: 'Gift card integration with Voucherify',
        },
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00Z',
        status: 'UP',
        checks: [
          {
            name: 'CoCo Permissions',
            status: 'UP',
          },
          {
            name: 'Voucherify Status check',
            status: 'UP',
          },
        ],
      });

      //When
      const responseGetStatus = await app.inject({
        method: 'GET',
        url: `/operations/status`,
        headers: {
          authorization: `Bearer ${jwtToken}`,
          'content-type': 'application/json',
        },
      });

      //Then
      expect(responseGetStatus.statusCode).toEqual(200);
      expect(responseGetStatus.json()).toEqual(
        expect.objectContaining({
          metadata: expect.any(Object),
          status: 'UP',
          timestamp: expect.any(String),
          version: '1.0.0',
          checks: expect.arrayContaining([
            expect.objectContaining({
              name: 'CoCo Permissions',
              status: 'UP',
            }),
            expect.objectContaining({
              name: 'Voucherify Status check',
              status: 'UP',
            }),
          ]),
        }),
      );
    });

    test('it should return the status of the connector in case of partial availability', async () => {
      //Given
      jest.spyOn(spiedGiftCardService, 'status').mockResolvedValue({
        metadata: {
          name: 'giftcard-integration-voucherify',
          description: 'Gift card integration with Voucherify',
        },
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00Z',
        status: 'Partially Available',
        checks: [
          {
            name: 'Voucherify Status check',
            status: 'DOWN',
            message: 'Failed to connect with Voucherify',
          },
          {
            name: 'CoCo Permissions',
            status: 'DOWN',
            message: `CoCo permissions are not correct, expected scopes: manage_payments view_sessions view_api_clients manage_orders introspect_oauth_tokens manage_checkout_payment_intents, actual scopes: manage_payments:dev-commercetools-checkout view_api_clients:dev-commercetools-checkout manage_orders:dev-commercetools-checkout introspect_oauth_tokens:dev-commercetools-checkout manage_checkout_payment_intents:dev-commercetools-checkout view_payments:dev-commercetools-checkout view_orders:dev-commercetools-checkout`,
            details: {
              expectedScopes: [
                'manage_payments',
                'view_sessions',
                'view_api_clients',
                'manage_orders',
                'introspect_oauth_tokens',
                'manage_checkout_payment_intents',
              ],
              actualScopes:
                'manage_payments:dev-commercetools-checkout view_api_clients:dev-commercetools-checkout manage_orders:dev-commercetools-checkout introspect_oauth_tokens:dev-commercetools-checkout manage_checkout_payment_intents:dev-commercetools-checkout view_payments:dev-commercetools-checkout view_orders:dev-commercetools-checkout',
              reason: 'scopes not available',
            },
          },
        ],
      });

      //When
      const responseGetStatus = await app.inject({
        method: 'GET',
        url: `/operations/status`,
        headers: {
          authorization: `Bearer ${jwtToken}`,
          'content-type': 'application/json',
        },
      });

      //Then
      expect(responseGetStatus.statusCode).toEqual(200);
      expect(responseGetStatus.json()).toEqual(
        expect.objectContaining({
          metadata: expect.any(Object),
          status: 'Partially Available',
          timestamp: expect.any(String),
          version: '1.0.0',
          checks: expect.arrayContaining([
            expect.objectContaining({
              name: 'CoCo Permissions',
              status: 'DOWN',
              message: `CoCo permissions are not correct, expected scopes: manage_payments view_sessions view_api_clients manage_orders introspect_oauth_tokens manage_checkout_payment_intents, actual scopes: manage_payments:dev-commercetools-checkout view_api_clients:dev-commercetools-checkout manage_orders:dev-commercetools-checkout introspect_oauth_tokens:dev-commercetools-checkout manage_checkout_payment_intents:dev-commercetools-checkout view_payments:dev-commercetools-checkout view_orders:dev-commercetools-checkout`,
              details: {
                expectedScopes: [
                  'manage_payments',
                  'view_sessions',
                  'view_api_clients',
                  'manage_orders',
                  'introspect_oauth_tokens',
                  'manage_checkout_payment_intents',
                ],
                actualScopes:
                  'manage_payments:dev-commercetools-checkout view_api_clients:dev-commercetools-checkout manage_orders:dev-commercetools-checkout introspect_oauth_tokens:dev-commercetools-checkout manage_checkout_payment_intents:dev-commercetools-checkout view_payments:dev-commercetools-checkout view_orders:dev-commercetools-checkout',
                reason: 'scopes not available',
              },
            }),
            expect.objectContaining({
              name: 'Voucherify Status check',
              status: 'DOWN',
              message: 'Failed to connect with Voucherify',
            }),
          ]),
        }),
      );
    });
  });
});
