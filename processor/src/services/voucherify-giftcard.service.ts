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
import { BalanceResponseSchemaDTO } from '../dtos/voucherify-giftcards.dto';
import { VoucherifyApiError, VoucherifyCustomError } from '../errors/voucherify-api.error';
import { log } from '../libs/logger';
import { BalanceConverter } from './converters/balance-converter';
import { getCartIdFromContext } from '../libs/fastify/context/context';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJSON = require('../../package.json');

export type VoucherifyGiftCardServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
  ctOrderService: CommercetoolsOrderService;
};

export class VoucherifyGiftCardService extends AbstractGiftCardService {
  private balanceConverter: BalanceConverter;
  constructor(opts: VoucherifyGiftCardServiceOptions) {
    super(opts.ctCartService, opts.ctPaymentService, opts.ctOrderService);
    this.balanceConverter = new BalanceConverter();
  }

  /**
   * Get status
   *
   * @remarks
   * Implementation to provide mocking status of external systems
   *
   * @returns Promise with mocking data containing a list of status from different external systems
   */
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
      }),
    })();

    return handler.body;
  }

  async balance(code: string): Promise<BalanceResponseSchemaDTO> {
    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });
    const amountPlanned = await this.ctCartService.getPaymentAmount({ cart: ctCart });

    try {
      const validationResult = await VoucherifyAPI().validations.validateStackable({
        redeemables: [
          {
            object: 'voucher',
            id: code,
          },
        ],
        order: {
          amount: amountPlanned.centAmount,
        },
      });

      if (validationResult.valid) {
        return this.balanceConverter.valid(validationResult.redeemables?.[0].result);
      }

      return this.balanceConverter.invalid(validationResult.redeemables?.[0].result);

      // TODO: check for currency difference
    } catch (err) {
      log.error('Error fetching voucher', { error: err });
      if (err instanceof VoucherifyCustomError || err instanceof VoucherifyApiError) {
        throw err;
      }

      throw new ErrorGeneral('Internal Server Error', {
        privateMessage: 'internal error making a call to voucherify',
        cause: err,
      });
    }
  }

  async redeem(): Promise<void> {
    throw new ErrorGeneral('operation not supported', {
      privateMessage: "connector doesn't support redeem operation yet",
    });
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
