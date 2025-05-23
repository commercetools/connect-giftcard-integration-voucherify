// copied over from https://github.com/voucherifyio/voucherify-js-sdk SdK seems to be poorly managed and not in par with API

export type ValidationSessionType = 'LOCK';
export type ValidationSessionTTLUnit =
  | 'DAYS'
  | 'HOURS'
  | 'MICROSECONDS'
  | 'MILLISECONDS'
  | 'MINUTES'
  | 'NANOSECONDS'
  | 'SECONDS';

export interface ValidationSessionParams {
  key?: string;
  type?: ValidationSessionType;
  ttl?: number;
  ttl_unit?: ValidationSessionTTLUnit;
}

export interface ValidationSessionResponse {
  key: string;
  type: ValidationSessionType;
  ttl: number;
  ttl_unit: ValidationSessionTTLUnit;
}

export interface ValidationSessionReleaseParams {
  key: string;
}
