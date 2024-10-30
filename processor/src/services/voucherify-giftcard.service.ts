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
import { RedemptionConverter } from './converters/redemption-converter';
import { getCartIdFromContext, getPaymentInterfaceFromContext } from '../libs/fastify/context/context';

import { PaymentModificationStatus } from '../dtos/operations/payment-intents.dto';

import { RedemptionsRedeemStackableParams, RedemptionsRedeemStackableResponse } from '../clients/types/redemptions';
import { PaymentDraft, Cart } from '@commercetools/connect-payments-sdk';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJSON = require('../../package.json');

export type VoucherifyGiftCardServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
  ctOrderService: CommercetoolsOrderService;
};

export class VoucherifyGiftCardService extends AbstractGiftCardService {
  private balanceConverter: BalanceConverter;
  private redemptionConverter: RedemptionConverter;
  constructor(opts: VoucherifyGiftCardServiceOptions) {
    super(opts.ctCartService, opts.ctPaymentService, opts.ctOrderService);
    this.balanceConverter = new BalanceConverter();
    this.redemptionConverter = new RedemptionConverter();
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
    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    let redeemAmount = opts.data.redeemAmount;
    const balance = opts.data.balance;
    const redeemCode = opts.data.code;

    try {
      if (!redeemAmount && !balance) {
        throw new VoucherifyCustomError({
          message: 'no redeem amount and current giftcard balance have been provided',
          code: 400,
          key: 'AmountNotSpecified',
        });
      }
      if (!redeemAmount && balance && balance.centAmount > ctCart.totalPrice.centAmount) {
        redeemAmount = {
          centAmount: ctCart.totalPrice.centAmount,
          currencyCode: getConfig().voucherifyCurrency,
        };
      } else if (!redeemAmount && balance && balance.centAmount <= ctCart.totalPrice.centAmount) {
        redeemAmount = {
          centAmount: balance.centAmount,
          currencyCode: getConfig().voucherifyCurrency,
        };
      }

      if (getConfig().voucherifyCurrency !== redeemAmount?.currencyCode) {
        throw new VoucherifyCustomError({
          message: 'cart and gift card currency do not match',
          code: 400,
          key: 'CurrencyNotMatch',
        });
      }

      const redemptionsRedeemStackableParams: RedemptionsRedeemStackableParams = {
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

      const redemptionResult: RedemptionsRedeemStackableResponse = await VoucherifyAPI().redemptions.redeemStackable(
        redemptionsRedeemStackableParams,
      );

      const paymentDraft: PaymentDraft = this.preparePaymentDraft(redemptionResult, ctCart);
      const ctPayment = await this.ctPaymentService.createPayment(paymentDraft);
      return this.redemptionConverter.convert({ redemptionResult, createPaymentResult: ctPayment });
    } catch (err) {
      log.error('Error in giftcard redemption', { error: err });

      if (err instanceof VoucherifyCustomError || err instanceof VoucherifyApiError) {
        throw err;
      }

      throw new ErrorGeneral('Internal Server Error', {
        privateMessage: 'internal error making a call to voucherify and composable commerce',
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

  private preparePaymentDraft(redemptionResult: RedemptionsRedeemStackableResponse, ctCart: Cart): PaymentDraft {
    const redemptionResultObj = redemptionResult.redemptions[0];

    return {
      interfaceId: redemptionResultObj.id,
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: getConfig().voucherifyCurrency,
        centAmount: redemptionResultObj.order?.amount,
        fractionDigits: 2,
      },
      paymentMethodInfo: {
        paymentInterface: getPaymentInterfaceFromContext() || 'voucherify',
        method: 'giftcard',
      },
      ...(ctCart.customerId && {
        customer: {
          typeId: 'customer',
          id: ctCart.customerId,
        },
      }),
      ...(!ctCart.customerId &&
        ctCart.anonymousId && {
          anonymousId: ctCart.anonymousId,
        }),
      transactions: [
        {
          type: this.getPaymentTransactionType('capturePayment'),
          amount: {
            centAmount: redemptionResultObj.order?.amount,
            type: 'centPrecision',
            currencyCode: getConfig().voucherifyCurrency,
            fractionDigits: 2,
          },
          interactionId: redemptionResultObj.id,
          state: this.redemptionConverter.convertVoucherifyResultCode(redemptionResultObj.result),
        },
      ],
    };
  }
}
