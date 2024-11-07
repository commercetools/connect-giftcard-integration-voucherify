import { SimpleCustomer } from './customers';
import { VouchersResponse } from './vouchers';

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
