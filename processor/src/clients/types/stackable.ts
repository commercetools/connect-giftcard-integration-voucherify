// copied over from https://github.com/voucherifyio/voucherify-js-sdk SdK seems to be poorly managed and not in par with API

/* eslint-disable @typescript-eslint/no-explicit-any */
import { GiftRedemptionParams } from './gift';
import { OrdersCreateResponse } from './orders';
import { ApplicableToResultList } from './applicable-to';
import {
  DiscountVouchersTypes,
  DiscountVouchersEffectTypes,
  DiscountUnitVouchersEffectTypes,
} from './discount-vouchers';
import { ValidationError } from './validation.error';

type ExpandOption = 'order' | 'redeemable' | 'redemption';

export interface StackableOptions {
  expand: ExpandOption[];
}

export type StackableRedeemableObject = 'promotion_stack' | 'promotion_tier' | 'voucher';

export interface StackableRedeemableParams {
  object: StackableRedeemableObject;
  id: string;
  gift?: GiftRedemptionParams;
}

export type StackableRedeemableResponseStatus = 'APPLICABLE' | 'INAPPLICABLE' | 'SKIPPED';

export interface StackableRedeemableResultDiscountUnit {
  effect: DiscountUnitVouchersEffectTypes;
  unit_off: number;
  unit_type: string;
}

export interface StackableRedeemableResultDiscount {
  type: DiscountVouchersTypes;
  effect: DiscountVouchersEffectTypes;
  amount_off?: number;
  amount_off_formula?: string;
  percent_off?: number;
  percent_off_formula?: string;
  amount_limit?: number;
  fixed_amount?: number;
  fixed_amount_formula?: string;
  unit_off?: number;
  unit_off_formula?: string;
  unit_type?: string;
  units?: StackableRedeemableResultDiscountUnit[];
}

export interface StackableRedeemableResultGift {
  credits?: number;
  balance?: number;
}

export interface StackableRedeemableResultResponse {
  gift?: StackableRedeemableResultGift;
  error?: ValidationError;
  details?: {
    key?: string;
    message?: string;
  };
}

export interface StackableRedeemableResponse {
  status: StackableRedeemableResponseStatus;
  id: string;
  object: StackableRedeemableObject;
  order?: OrdersCreateResponse;
  applicable_to?: ApplicableToResultList;
  inapplicable_to?: ApplicableToResultList;
  result?: StackableRedeemableResultResponse;
  metadata?: Record<string, any>;
}

export type StackableRedeemableInapplicableResponse = {
  status: 'INAPPLICABLE';
  id: string;
  object: 'voucher' | 'promotion_tier';
  result: {
    error?: ValidationError;
    details?: {
      key?: string;
      message?: string;
    };
  };
  metadata?: Record<string, unknown>;
};

export type StackableRedeemableSkippedResponse = {
  status: 'SKIPPED';
  id: string;
  object: 'voucher' | 'promotion_tier';
  result: {
    details?: {
      key?: string;
      message?: string;
    };
  };
  metadata?: Record<string, unknown>;
};
