import { GiftCardOptions } from '../providers/definitions';

export const getInput = (field: string) => document.querySelector(`#${field}`) as HTMLInputElement;

export const fieldIds = {
  code: 'giftcard-code',
};

const handleChangeEvent = (field: string, onValueChange?: (hasValue: boolean) => Promise<void>) => {
  const input = getInput(field);
  if (input) {
    let hasValue = false;

    input.addEventListener('input', () => {
      if (!hasValue && input.value !== '') {
        hasValue = true;

        onValueChange?.(hasValue);
      } else if (hasValue && input.value === '') {
        hasValue = false;

        onValueChange?.(hasValue);
      }
    });
  }
};

export const addFormFieldsEventListeners = (giftcardOptions: GiftCardOptions) => {
  handleChangeEvent(fieldIds.code, giftcardOptions?.onValueChange);
};
