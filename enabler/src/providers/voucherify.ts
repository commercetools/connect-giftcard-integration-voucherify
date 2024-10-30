import { FormBuilder } from '../components/form';
import { BaseOptions, EnablerOptions, GiftCardEnabler, GiftCardBuilder, PaymentResult } from './definitions';

export class VoucherifyEnabler implements GiftCardEnabler {
  setupData: Promise<{ baseOptions: BaseOptions }>;

  constructor(options: EnablerOptions) {
    this.setupData = VoucherifyEnabler._Setup(options);
  }

  // Default handlers
  private static onError = (err: any) => {
    console.log(err);
    throw new Error('something went wrong.');
  };

  private static onComplete = (result: PaymentResult) => {
    console.log('onSubmit', result);
  };

  private static _Setup = async (options: EnablerOptions): Promise<{ baseOptions: BaseOptions }> => {
    // HINT: config calls can be done here, to be used if necessary in the enabler

    return {
      baseOptions: {
        sessionId: options.sessionId,
        processorUrl: options.processorUrl,
        locale: options.locale,
        onComplete: options.onComplete ? options.onComplete : this.onComplete,
        onError: options.onError ? options.onError : this.onError,
      },
    };
  };

  async createGiftCardBuilder(): Promise<GiftCardBuilder | never> {
    const setupData = await this.setupData;
    if (!setupData) {
      throw new Error('VoucherifyEnabler not initialized');
    }

    return new FormBuilder(setupData.baseOptions);
  }
}
