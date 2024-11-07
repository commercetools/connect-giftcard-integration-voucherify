/* eslint-disable @typescript-eslint/no-explicit-any */
import { OrdersCreateResponse, OrdersCreate } from './orders';
import { CustomersCreateBody, SimpleCustomer } from './customers';
import { VouchersResponse } from './vouchers';
import { ValidationSessionParams } from './validate-session';
import {
  StackableOptions,
  StackableRedeemableInapplicableResponse,
  StackableRedeemableParams,
  StackableRedeemableSkippedResponse,
} from './stackable';

export interface RedemptionsRedeemResponse {
  id: string;
  object: 'redemption';
  date?: string;
  amount?: number;
  customer_id?: string;
  tracking_id?: string;
  order?: OrdersCreateResponse;
  metadata?: Record<string, any>;
  result: 'SUCCESS' | 'FAILURE';
  voucher: VouchersResponse;
  customer?: SimpleCustomer;
  related_object_type: 'voucher';
  gift?: {
    amount: number;
  };
  failure_code?: string;
  failure_message?: string;
}

export interface Redemption {
  id: string;
  object: 'redemption';
  date?: string;
  customer_id?: string;
  tracking_id?: string;
  order?: Omit<OrdersCreateResponse, 'object'> & {
    related_object_id: string;
    related_object_type: 'redemption';
    referrer?: string;
  };
  metadata?: Record<string, any>;
  result: 'SUCCESS' | 'FAILURE';
  failure_code?: string;
  failure_message?: string;
  customer?: SimpleCustomer;
  related_object_type?: 'string';
  voucher?: {
    code: string;
    campaign?: string;
    id: string;
    object: 'voucher';
    campaign_id?: string;
  };
  gift?: {
    amount: number;
  };
  loyalty_card?: {
    points: number;
  };
}

export interface RedemptionsRollbackParams {
  reason?: string;
  tracking_id?: string;
  customer?: SimpleCustomer & { description?: string };
}

export interface RedemptionsRollbackQueryParams {
  reason?: string;
  tracking_id?: string;
}

export interface RedemptionsRollbackPayload {
  customer?: SimpleCustomer & { description?: string };
}

export interface RedemptionsRollbackResponse {
  id: string;
  object: 'redemption_rollback';
  date?: string;
  customer_id?: string;
  tracking_id?: string;
  redemption?: string;
  amount?: number;
  reason?: string;
  result: 'SUCCESS' | 'FAILURE';
  voucher?: VouchersResponse;
  customer?: SimpleCustomer;
  reward?: {
    assignment_id: string;
    object: 'reward';
  };
}

export interface RedemptionsRedeemStackableParams {
  options?: StackableOptions;
  redeemables: StackableRedeemableParams[];
  session?: ValidationSessionParams;
  order?: OrdersCreate;
  customer?: CustomersCreateBody;
  metadata?: Record<string, any>;
}

export type RedemptionsRedeemStackableRedemptionResult = RedemptionsRedeemResponse & {
  redemption: string;
};

export type RedemptionsRedeemStackableOrderResponse = OrdersCreateResponse & {
  redemptions?: Record<
    string,
    {
      date: string;
      rollback_id?: string;
      rollback_date?: string;
      related_object_type: 'redemption';
      related_object_id: string;
      stacked: string[];
      rollback_stacked?: string[];
    }
  >;
};

export interface RedemptionsRedeemStackableResponse {
  redemptions: RedemptionsRedeemStackableRedemptionResult[];
  parent_redemption: {
    id: string;
    object: 'redemption';
    date: string;
    customer_id?: string;
    tracking_id?: string;
    metadata?: Record<string, any>;
    result: 'SUCCESS' | 'FAILURE';
    order?: RedemptionsRedeemStackableOrderResponse;
    customer?: SimpleCustomer;
    related_object_type: 'redemption';
    related_object_id: string;
  };
  order?: RedemptionsRedeemStackableOrderResponse;
  skipped_redeemables?: StackableRedeemableSkippedResponse;
  inapplicable_redeemables?: StackableRedeemableInapplicableResponse;
}
