/* eslint-disable @typescript-eslint/no-explicit-any */

import { VoucherifyError } from './voucherify.error';

import Qs from 'qs';

export interface RequestControllerOptions {
  baseURL: string;
  basePath: string;
  headers: Record<string, any>;
  exposeErrorCause: boolean;
}

export class RequestController {
  private baseURL: string;
  private basePath: string;
  private headers: Record<string, any>;
  private lastResponseHeaders: Record<string, string>;
  private isLastResponseHeadersSet: boolean;
  private exposeErrorCause: boolean;

  constructor({ basePath, baseURL, headers, exposeErrorCause }: RequestControllerOptions) {
    this.basePath = basePath;
    this.baseURL = baseURL;
    this.headers = headers;
    this.exposeErrorCause = exposeErrorCause;
    this.lastResponseHeaders = {};
    this.isLastResponseHeadersSet = false;
  }

  public isLastReponseHeadersSet(): boolean {
    return this.isLastResponseHeadersSet;
  }

  public getLastResponseHeaders(): Record<string, string> {
    return this.lastResponseHeaders;
  }

  private setLastResponseHeaders(headers: Headers) {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });

    this.lastResponseHeaders = result;
    this.isLastResponseHeadersSet = true;
  }

  public setBaseUrl(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async handleRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: Record<string, any>,
    params?: Record<string, any>,
    additionalHeaders?: Record<string, any>,
  ): Promise<T> {
    const url = new URL(`${this.baseURL}/${this.basePath}${path}`);

    if (params) {
      url.search = Qs.stringify(params);
    }

    const headers = { ...this.headers, ...additionalHeaders };
    const options: RequestInit = {
      method,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url.toString(), options);
      this.setLastResponseHeaders(response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        throw new VoucherifyError(
          response.status,
          errorData,
          this.exposeErrorCause ? new Error(response.statusText) : undefined,
        );
      }

      return await response.json();
    } catch (error: any) {
      if (this.exposeErrorCause && error instanceof Error) {
        throw new VoucherifyError(500, 'Request failed', error);
      }
      throw error;
    }
  }

  public async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    return this.handleRequest<T>('GET', path, undefined, params);
  }

  public async post<T>(
    path: string,
    body: Record<string, any>,
    params?: Record<string, any>,
    headers?: Record<string, any>,
  ): Promise<T> {
    return this.handleRequest<T>('POST', path, body, params, headers);
  }

  public async put<T>(path: string, body: Record<string, any>, params?: Record<string, any>): Promise<T> {
    return this.handleRequest<T>('PUT', path, body, params);
  }

  public async delete<T>(path: string, params?: Record<string, any>): Promise<T> {
    return this.handleRequest<T>('DELETE', path, undefined, params);
  }
}
