// copied over from https://github.com/voucherifyio/voucherify-js-sdk SdK seems to be poorly managed and not in par with API

/* eslint-disable @typescript-eslint/no-explicit-any */
import { DiscountUnit, DiscountAmount, DiscountPercent, DiscountFixed } from './discount-vouchers';

// Legacy types
export type VoucherType = 'GIFT_VOUCHER' | 'DISCOUNT_VOUCHER' | 'LOYALTY_CARD' | 'LUCKY_DRAW';
export interface SimpleVoucher {
  code_config?: {
    length?: number;
    charset?: string;
    pattern?: string;
    prefix?: string;
    suffix?: string;
  };
  type: VoucherType;
  is_referral_code?: boolean;
  discount?: DiscountUnit | DiscountAmount | DiscountPercent | DiscountFixed;
  loyalty_card?: {
    points: number;
    balance: number;
  };
  redemption?: {
    quantity: number;
  };
}

export interface VouchersResponse {
  id: string;
  code: string;
  campaign?: string;
  category?: string;
  type?: 'DISCOUNT_VOUCHER' | 'GIFT_VOUCHER';
  discount?: DiscountAmount | DiscountPercent | DiscountUnit | DiscountFixed;
  gift?: {
    amount: number;
    balance: number;
  };
  loyalty_card?: {
    points: number;
  };
  start_date?: string;
  expiration_date?: string;
  validity_timeframe?: {
    interval: string;
    duration: string;
  };
  validity_day_of_week?: number[];
  publish?: {
    object: 'list';
    count: number;
    data_ref: 'entries';
    entries: string[];
    total: number;
    url: string;
  };
  redemption?: {
    object: 'list';
    quantity?: number;
    redeemed_quantity: number;
    data_ref: 'redemption_entries';
    redemption_entries: string[];
    total: number;
    url: string;
  };
  active: boolean;
  additional_info?: string;
  metadata?: Record<string, any>;
  assets?: {
    qr?: {
      id: string;
      url: string;
    };
    barcode?: {
      id: string;
      url: string;
    };
  };
  is_referral_code: boolean;
  referrer_id?: string;
  holder_id?: string;
  updated_at?: string;
  created_at: string;
  object: 'voucher';
  validation_rules_assignments: {
    object: 'list';
    total: number;
    data_ref: 'data';
    data?: {
      id: string;
      rule_id?: string;
      related_object_id?: string;
      related_object_type?: string;
      created_at: string;
      object: 'validation_rules_assignment';
    }[];
  };
}

export type VouchersGetResponse = VouchersResponse;

export interface VouchersListParams {
  limit?: number;
  page?: number;
  category?: string;
  campaign?: string;
  customer?: string;
  created_at?: {
    after?: string;
    before?: string;
  };
  updated_at?: {
    after?: string;
    before?: string;
  };
  order?:
    | '-created_at'
    | 'created_at'
    | '-updated_at'
    | 'updated_at'
    | '-type'
    | 'type'
    | '-code'
    | 'code'
    | '-campaign'
    | 'campaign'
    | '-category'
    | 'category';
  filters?: {
    junction?: string;
    [filter_condition: string]: any;
  };
}

export interface VouchersListResponse {
  object: 'list';
  total: number;
  data_ref: 'vouchers';
  vouchers: VouchersResponse[];
}

export interface GiftCardTransactionBase {
  id: string;
  source_id: string | null;
  voucher_id: string;
  campaign_id: string | null;
  related_transaction_id: string | null;
  reason: string | null;
  created_at: string;
}
