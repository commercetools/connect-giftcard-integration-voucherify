import { GiftCardOptions } from '../providers/definitions';
import inputFieldStyles from '../style/inputField.module.scss';

export const getInput = (field: string) => document.querySelector(`#${field}`) as HTMLInputElement;

export const fieldIds = {
  code: 'giftcard-code',
};

const isFieldValid = (field: string) => {
  const input = getInput(field);
  switch (field) {
    case 'giftcard-code':
      return input.value.length > 0;
    default:
      return false;
  }
};

const showErrorIfInvalid = (field: string) => {
  if (!isFieldValid(field)) {
    const input = getInput(field);
    input.parentElement.classList.add(inputFieldStyles.error);
    input.parentElement
      .querySelector(`#${field} + .${inputFieldStyles.errorField}`)
      .classList.remove(inputFieldStyles.hidden);
  }
};

const hideErrorIfValid = (field: string) => {
  if (isFieldValid(field)) {
    const input = getInput(field);
    input.parentElement.classList.remove(inputFieldStyles.error);
    input.parentElement
      .querySelector(`#${field} + .${inputFieldStyles.errorField}`)
      .classList.add(inputFieldStyles.hidden);
  }
};

const handleFieldValidation = (field: string) => {
  const input = getInput(field);
  input.addEventListener('input', () => {
    hideErrorIfValid(field);
  });
  input.addEventListener('focusout', () => {
    showErrorIfInvalid(field);
    input.value.length > 0
      ? input.parentElement.classList.add(inputFieldStyles.containValue)
      : input.parentElement.classList.remove(inputFieldStyles.containValue);
  });
};

const handleChangeEvent = (field: string, onChange?: (isDirty: boolean) => void) => {
  const input = getInput(field);
  if (input) {
    let isDirty = false;

    input.addEventListener('input', () => {
      if (!isDirty && input.value !== '') {
        isDirty = true;

        onChange?.(isDirty);
      } else if (isDirty && input.value === '') {
        isDirty = false;

        onChange?.(isDirty);
      }
    });
  }
};

export const addFormFieldsEventListeners = (giftcardOptions: GiftCardOptions) => {
  handleFieldValidation(fieldIds.code);
  handleChangeEvent(fieldIds.code, giftcardOptions?.onChange);
};
