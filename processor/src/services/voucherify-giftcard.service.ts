import {
  CommercetoolsCartService,
  CommercetoolsPaymentService,
  healthCheckCommercetoolsPermissions,
  statusHandler,
  CommercetoolsOrderService,
  ErrorGeneral,
} from '@commercetools/connect-payments-sdk';
import {
  CancelPaymentRequest,
  CapturePaymentRequest,
  PaymentProviderModificationResponse,
  RefundPaymentRequest,
  StatusResponse,
} from './types/operation.type';
import { config } from '../config/config';
import { appLogger, paymentSDK } from '../payment-sdk';
import { AbstractGiftCardService } from './abstract-giftcard.service';
import { VoucherifyAPI } from '../clients/voucherify.client';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJSON = require('../../package.json');

export type VoucherifyGiftCardServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
  ctOrderService: CommercetoolsOrderService;
};

export class VoucherifyGiftCardService extends AbstractGiftCardService {
  constructor(opts: VoucherifyGiftCardServiceOptions) {
    super(opts.ctCartService, opts.ctPaymentService, opts.ctOrderService);
  }

  async status(): Promise<StatusResponse> {
    const handler = await statusHandler({
      timeout: config.healthCheckTimeout,
      log: appLogger,
      checks: [
        healthCheckCommercetoolsPermissions({
          requiredPermissions: [
            'manage_payments',
            'view_sessions',
            'view_api_clients',
            'manage_orders',
            'introspect_oauth_tokens',
            'manage_checkout_payment_intents',
          ],
          ctAuthorizationService: paymentSDK.ctAuthorizationService,
          projectKey: config.projectKey,
        }),
        async () => {
          try {
            const result = await VoucherifyAPI().vouchers.list({
              limit: 1,
            });
            return {
              name: 'Voucherify Status check',
              status: 'UP',
              details: {
                vouchers: result.vouchers,
              },
            };
          } catch (e) {
            return {
              name: 'Voucherify Status check',
              status: 'DOWN',
              message: `Not able to talk to the Voucherify API`,
              details: {
                error: e,
              },
            };
          }
        },
      ],
      metadataFn: async () => ({
        name: packageJSON.name,
        description: packageJSON.description,
        '@voucherify/sdk': packageJSON.dependencies['@voucherify/sdk'],
      }),
    })();

    return handler.body;
  }

  /**
   * Capture payment
   *
   * @remarks
   * Implementation to provide the mocking data for payment capture in external PSPs
   *
   * @param request - contains the amount and {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
   * @returns Promise with mocking data containing operation status and PSP reference
   */
  async capturePayment(request: CapturePaymentRequest): Promise<PaymentProviderModificationResponse> {
    throw new ErrorGeneral('operation not supported', {
      fields: {
        pspReference: request.payment.interfaceId,
      },
      privateMessage: "connector doesn't support capture operation",
    });
  }

  /**
   * Cancel payment
   *
   * @remarks
   * Implementation to provide the mocking data for payment cancel in external PSPs
   *
   * @param request - contains {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
   * @returns Promise with mocking data containing operation status and PSP reference
   */
  async cancelPayment(request: CancelPaymentRequest): Promise<PaymentProviderModificationResponse> {
    throw new ErrorGeneral('operation not supported', {
      fields: {
        pspReference: request.payment.interfaceId,
      },
      privateMessage: "connector doesn't support cancel operation",
    });
  }

  /**
   * Refund payment
   *
   * @remarks
   * Implementation to provide the mocking data for payment refund in external PSPs
   *
   * @param request - contains amount and {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
   * @returns Promise with mocking data containing operation status and PSP reference
   */
  async refundPayment(request: RefundPaymentRequest): Promise<PaymentProviderModificationResponse> {
    throw new ErrorGeneral('operation not supported', {
      fields: {
        pspReference: request.payment.interfaceId,
      },
      privateMessage: "connector doesn't support refund operation",
    });
  }
}
