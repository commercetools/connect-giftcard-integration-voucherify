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
import { getConfig } from '../config/config';
import { appLogger, paymentSDK } from '../payment-sdk';
import { AbstractGiftCardService } from './abstract-giftcard.service';
import { VoucherifyAPI } from '../clients/voucherify.client';
import { BalanceResponseSchemaDTO, RedeemRequestDTO, RedeemResponseDTO } from '../dtos/voucherify-giftcards.dto';
import { VoucherifyApiError, VoucherifyCustomError } from '../errors/voucherify-api.error';
import { log } from '../libs/logger';
import { BalanceConverter } from './converters/balance-converter';
import { getCartIdFromContext } from '../libs/fastify/context/context';

import { PaymentModificationStatus } from '../dtos/operations/payment-intents.dto';

import { RedemptionsRedeemStackableParams, RedemptionsRedeemStackableResponse } from '../clients/types/redemptions';

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
      timeout: getConfig().healthCheckTimeout,
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
          projectKey: getConfig().projectKey,
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

      if (!validationResult.valid) {
        return this.balanceConverter.invalid(validationResult.redeemables?.[0].result);
      }

      if (getConfig().voucherifyCurrency !== amountPlanned.currencyCode) {
        throw new VoucherifyCustomError({
          message: 'cart and gift card currency do not match',
          code: 400,
          key: 'CurrencyNotMatch',
        });
      }

      return this.balanceConverter.valid(validationResult.redeemables?.[0].result);
    } catch (err) {
      log.error('Error fetching gift card', { error: err });

      if (err instanceof VoucherifyCustomError || err instanceof VoucherifyApiError) {
        throw err;
      }

      throw new ErrorGeneral('Internal Server Error', {
        privateMessage: 'internal error making a call to voucherify',
        cause: err,
      });
    }
  }

  async redeem(opts: { data: RedeemRequestDTO }): Promise<RedeemResponseDTO> {
    // TODO : Validate the datatype of incoming request
    let redeemAmount = opts.data.redeemAmount;
    const balance = opts.data.balance;
    const redeemCode = opts.data.code;
    /**
     * TODO :
     * - If no amount is received
     *    If cart amount < balance → Redeem cart amount
          If cart amount >= balance → Redeem the full balance
        - Create payment and payment transaction on CoCo
        - Transaction will be of type Capture
        - Define the API to support the submit() enabler function https://commercetools.atlassian.net/wiki/spaces/IM/pages/1181515777/Giftcard+Integration#Interface%3A-GiftcardComponent  
        - Save the redemption id in the Paymet
        - Print into the logs the exact reason of the issue in case of error
        - Add necessary tests
        - Update the giftcard documentation accordingly: 
     */
    try {
      if (!redeemAmount && !balance) {
        const balanceResult: BalanceResponseSchemaDTO = await this.balance(redeemCode);
        redeemAmount = balanceResult.amount;
      } else if (balance && !redeemAmount) {
        redeemAmount = balance;
      } else if (balance && redeemAmount && redeemAmount.centAmount < balance.centAmount) {
        redeemAmount = balance;
      }

      if (getConfig().voucherifyCurrency !== redeemAmount?.currencyCode) {
        throw new VoucherifyCustomError({
          message: 'cart and gift card currency do not match',
          code: 400,
          key: 'CurrencyNotMatch',
        });
      }

      const redeemStackableRequestObj: RedemptionsRedeemStackableParams = {
        redeemables: [
          {
            object: 'voucher',
            id: redeemCode,
          },
        ],
        order: {
          amount: redeemAmount.centAmount,
        },
      };

      const redemptionResult: RedemptionsRedeemStackableResponse =
        await VoucherifyAPI().redemptions.redeemStackable(redeemStackableRequestObj);

      const redemptionResultObj = redemptionResult.redemptions[0];
      if (redemptionResultObj.result === 'SUCCESS') {
        // TODO : update COCO
      }
      return Promise.resolve({
        result: redemptionResultObj.result,
      });
    } catch (err) {
      log.error('Error fetching gift card', { error: err });

      if (err instanceof VoucherifyCustomError || err instanceof VoucherifyApiError) {
        throw err;
      }

      throw new ErrorGeneral('Internal Server Error', {
        privateMessage: 'internal error making a call to voucherify',
        cause: err,
      });
    }
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
    const ctPayment = await this.ctPaymentService.getPayment({
      id: request.payment.id,
    });
    const redemptionId = ctPayment.interfaceId;
    const rollbackResult = await VoucherifyAPI().redemptions.rollback(redemptionId as string);

    return {
      outcome:
        rollbackResult.result === 'SUCCESS' ? PaymentModificationStatus.APPROVED : PaymentModificationStatus.REJECTED,
      pspReference: rollbackResult.id,
    };
  }
}
