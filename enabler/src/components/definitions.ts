import {
  BaseOptions,
  GiftCardOptions,
  GiftCardComponent,
  GiftCardBuilder,
  BalanceType,
  Amount,
} from '../providers/definitions';

/**
 * Base Web Component
 */
export abstract class BaseComponentBuilder implements GiftCardBuilder {
  protected baseOptions: BaseOptions;

  constructor(baseOptions: BaseOptions) {
    this.baseOptions = baseOptions;
  }

  abstract build(config: GiftCardOptions): GiftCardComponent;
}

export abstract class DefaultComponent implements GiftCardComponent {
  protected giftcardOptions: GiftCardOptions;
  protected baseOptions: BaseOptions;

  constructor(opts: { giftcardOptions: GiftCardOptions; baseOptions: BaseOptions }) {
    this.giftcardOptions = opts.giftcardOptions;
    this.baseOptions = opts.baseOptions;
  }
  abstract balance(): Promise<BalanceType>;

  abstract submit(opts: { amount?: Amount }): void;

  abstract mount(selector: string): void;

  getState?(): {
    code?: string;
  };
}
