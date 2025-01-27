import { GiftCardOptions } from '../providers/definitions';
import inputFieldStyles from '../style/inputField.module.scss';

export const getInput = (field: string) => document.querySelector(`#${field}`) as HTMLInputElement;

export const fieldIds = {
  code: 'giftcard-code',
};

const handleChangeEvent = (field: string, onValueChange?: (hasValue: boolean) => Promise<void>) => {
  const input = getInput(field);
  if (input) {
    input.addEventListener('input', () => {
      onValueChange?.(input.value !== '');
    });
  }

  input.addEventListener('focusout', () => {
    input.value.length > 0
      ? input.parentElement.classList.add(inputFieldStyles.containValue)
      : input.parentElement.classList.remove(inputFieldStyles.containValue);
  });
};

export const addFormFieldsEventListeners = (giftcardOptions: GiftCardOptions) => {
  handleChangeEvent(fieldIds.code, giftcardOptions?.onValueChange);
};
