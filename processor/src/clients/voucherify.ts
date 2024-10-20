import { RequestController } from './voucherify-request-controller';
import { Vouchers } from './vouchers';
import { Validations } from './validations';
import { assert, isString, isObject } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJSON = require('../../package.json');

// copied over from https://github.com/voucherifyio/voucherify-js-sdk SdK seems to be poorly managed and not in par with API
export interface VoucherifyOptions {
  /**
   * Optionally, you can add `apiUrl` to the client options if you want to use Voucherify running in a specific region.
   *
   * ```javascript
   * const voucherify = VoucherifyServerSide({
   *		applicationId: 'YOUR-APPLICATION-ID',
   *		secretKey: 'YOUR-SECRET-KEY',
   *		apiUrl: 'https://<region>.api.voucherify.io'
   * })
   * ```
   */
  apiUrl?: string;
  /**
   * [Log-in](https://app.voucherify.io/#/login) to Voucherify web interface and obtain your `Application Keys` from [Configuration](https://app.voucherify.io/#/app/core/projects/current/general):
   *
   * ```javascript
   * const voucherify = VoucherifyServerSide({
   *		applicationId: 'YOUR-APPLICATION-ID',
   *		secretKey: 'YOUR-SECRET-KEY'
   * })
   * ```
   */
  applicationId: string;
  /**
   * [Log-in](https://app.voucherify.io/#/login) to Voucherify web interface and obtain your `Application Keys` from [Configuration](https://app.voucherify.io/#/app/core/projects/current/general):
   *
   * ```javascript
   * const voucherify = VoucherifyServerSide({
   *		applicationId: 'YOUR-APPLICATION-ID',
   *		secretKey: 'YOUR-SECRET-KEY'
   * })
   * ```
   */
  secretKey: string;
  /**
   * Set this option to disable displaying the warning about exposing your `secretKey` if you're using VoucherifyServerSide in a browser environment.
   * By setting this option to `true`, you acknowledge that you understand the risks of exposing your `secretKey` to a browser environment.
   *
   * ```javascript
   * const voucherify = VoucherifyServerSide({
   *		applicationId: 'YOUR-APPLICATION-ID',
   *		secretKey: 'YOUR-SECRET-KEY',
   *		dangerouslySetSecretKeyInBrowser: true
   * })
   * ```
   */
  dangerouslySetSecretKeyInBrowser?: boolean;
  /**
   * You can pass additional headers to requests made by the API Client.
   * It can prove to be useful when debugging various scenarios.
   * ```javascript
   * const voucherify = VoucherifyServerSide({
   *		applicationId: 'YOUR-APPLICATION-ID',
   *		secretKey: 'YOUR-SECRET-KEY',
   *		customHeaders: {
   *			"DEBUG-HEADER": "my_value",
   *			"TEST-HEADER": "another_value"
   *		}
   * })
   * ```
   */
  customHeaders?: Record<string, string>;
  /**
   * If you wish to include original Axios error in VoucherifyError instance set this to true
   * It can prove to be useful when debugging various scenarios.
   * The original Axios error will be included in cause property of VoucherifyError
   */
  exposeErrorCause?: boolean;
  /**
   * Optionally, you can set timeout in miliseconds. After this time request will be aborted. By default Voucherify's API has timeout value of 3 minutes.
   */
  timeoutMs?: number;
}
interface VoucherifyHeaders {
  'X-App-Id': string;
  'X-App-Token': string;
  'X-Voucherify-Channel': string;
  'Content-Type': 'application/json';
}

export function Voucherify(options: VoucherifyOptions) {
  assert(isObject(options), 'Voucherify: the "options" argument must be an object');
  assert(isString(options.applicationId), 'Voucherify: "options.applicationId" is required');
  assert(isString(options.secretKey), 'Voucherify: "options.secretKey" is required');

  let headers: VoucherifyHeaders = {
    'X-App-Id': options.applicationId,
    'X-App-Token': options.secretKey,
    'X-Voucherify-Channel': `${packageJSON.name}-${packageJSON.version}`,
    'Content-Type': 'application/json',
  };

  if (isObject(options.customHeaders)) {
    headers = Object.assign({}, headers, options.customHeaders);
  }

  const client = new RequestController({
    basePath: 'v1',
    baseURL: options.apiUrl ?? 'https://api.voucherify.io',
    headers,
    exposeErrorCause: options.exposeErrorCause ?? false,
    timeoutMs: options.timeoutMs ?? 0,
  });

  const vouchers = new Vouchers(client);
  const validations = new Validations(client);

  return {
    vouchers,
    validations,
  };
}
