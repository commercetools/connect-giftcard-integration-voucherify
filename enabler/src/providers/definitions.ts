export interface GiftCardComponent {
  submit(opts: { amount?: Amount }): void;
  balance(): Promise<BalanceType>;
  mount(selector: string): void;
  getState?(): {
    code?: string;
  };
}

export type Amount = {
  centAmount: number;
  currencyCode: string;
};

export interface GiftCardBuilder {
  build(config: GiftCardOptions): GiftCardComponent;
}

export type GiftCardOptions = {
  onGiftCardReady?: () => Promise<void>;
  onGiftCardSubmit?: () => Promise<void>;
  onChange?: (isDirty: boolean) => Promise<void>;
};

export type BaseOptions = {
  sessionId: string;
  processorUrl: string;
  locale?: string;
  onComplete?: (result: PaymentResult) => void;
  onError?: (error: any) => void;
};

export type BalanceType = {
  status: {
    state: 'Valid' | 'NotFound' | 'Expired' | 'CurrencyNotMatch' | 'GenericError';
    errors?: {
      code: string;
      message: string;
    };
  };
  amount?: {
    centAmount: number;
    currencyCode: string;
  };
};

export type EnablerOptions = {
  processorUrl: string;
  sessionId: string;
  locale?: string;
  onComplete?: (result: PaymentResult) => void;
  onError?: (error: any) => void;
};

export type PaymentResult =
  | {
      isSuccess: true;
      paymentReference: string;
    }
  | { isSuccess: false };

export interface GiftCardEnabler {
  /**
   * @throws {Error}
   */
  createGiftCardBuilder: (type: string) => Promise<GiftCardBuilder | never>;
}
