// copied over from https://github.com/voucherifyio/voucherify-js-sdk SdK seems to be poorly managed and not in par with API

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomersCreateBody } from './customers';
import {
  StackableOptions,
  StackableRedeemableInapplicableResponse,
  StackableRedeemableParams,
  StackableRedeemableResponse,
  StackableRedeemableSkippedResponse,
} from './stackable';
import { ValidationSessionParams, ValidationSessionResponse } from './validate-session';

import { OrdersCreate, OrdersCreateResponse } from './orders';

export interface ValidationsValidateStackableParams {
  options?: StackableOptions;
  redeemables: StackableRedeemableParams[];
  session?: ValidationSessionParams;
  order?: OrdersCreate;
  customer?: CustomersCreateBody;
  metadata?: Record<string, any>;
}

export interface ValidationValidateStackableResponse {
  valid: boolean;
  tracking_id?: string;
  session?: ValidationSessionResponse;
  order?: OrdersCreateResponse;
  redeemables?: StackableRedeemableResponse[];
  skipped_redeemables?: StackableRedeemableSkippedResponse[];
  inapplicable_redeemables?: StackableRedeemableInapplicableResponse[];
  stacking_rules: ValidationsStackingRules;
}

export type ValidationsStackingRules = {
  redeemables_limit: number;
  applicable_redeemables_limit: number;
  applicable_redeemables_per_category_limit?: number;
  applicable_exclusive_redeemables_limit: number;
  applicable_exclusive_redeemables_per_category_limit?: number;
  exclusive_categories: string[];
  joint_categories: string[];
  redeemables_application_mode: 'ALL' | 'PARTIAL';
  redeemables_sorting_rule: 'CATEGORY_HIERARCHY' | 'REQUESTED_ORDER';
};
