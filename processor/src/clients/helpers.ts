// copied over from https://github.com/voucherifyio/voucherify-js-sdk SdK seems to be poorly managed and not in par with API

/* eslint-disable @typescript-eslint/no-explicit-any */
export function encode(value: string = '') {
  return encodeURIComponent(value);
}
export function isNumber(value: any): value is number {
  return typeof value === 'number' && value === value;
}
export function isString(value: any): value is string {
  return typeof value === 'string';
}
export function isOptionalString(value: any): value is string | undefined {
  return value == null || isString(value);
}
export function isObject<T extends Record<string, any> = Record<string, any>>(value: any): value is T {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
}
export function isOptionalObject<T extends Record<string, any> = Record<string, any>>(
  value: any,
): value is T | null | undefined {
  return value == null || isObject(value);
}

export function environment(): string {
  if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    return 'Browser';
  } else if (typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope') {
    return 'WebWorker';
  } else if (typeof process !== 'undefined' && process.versions != null && process.versions.node != null) {
    return `Node.js-${process.version}`;
  } else if (
    (typeof window !== 'undefined' && window.name === 'nodejs') ||
    navigator.userAgent.includes('Node.js') ||
    navigator.userAgent.includes('jsdom')
  ) {
    return 'JsDom';
  }

  return 'Unknown';
}

export function assert(condition: any, message?: string): asserts condition {
  if (condition) return;
  throw new Error(message);
}
