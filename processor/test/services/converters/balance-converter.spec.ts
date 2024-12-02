import { describe, test, expect } from '@jest/globals';
import { BalanceConverter } from '../../../src/services/converters/balance-converter';
import { StackableRedeemableObject, StackableRedeemableResponseStatus } from '../../../src/clients/types/stackable';
import { ValidationsStackingRules, ValidationValidateStackableResponse } from '../../../src/clients/types/validations';

describe('balance.converter', () => {
  const converter = new BalanceConverter();

  test('convert a valid gift card response', () => {
    const argument: ValidationValidateStackableResponse = {
      stacking_rules: {} as ValidationsStackingRules,
      valid: true,
      redeemables: [
        {
          id: 'some',
          result: {
            gift: {
              balance: 10000,
              credits: 1,
            },
          },
          status: {} as StackableRedeemableResponseStatus,
          object: {} as StackableRedeemableObject,
        },
      ],
    };

    // Act
    const result = converter.convert(argument);

    // Assert
    expect(result).toEqual({
      status: {
        state: 'Valid',
      },
      amount: {
        centAmount: 10000,
        currencyCode: '',
      },
    });
  });

  test('convert invalid - voucher expired gift card response', () => {
    const argument: ValidationValidateStackableResponse = {
      stacking_rules: {} as ValidationsStackingRules,
      valid: false,
      redeemables: [
        {
          id: 'some',
          result: {
            gift: {
              balance: 10000,
              credits: 1,
            },
            error: {
              code: 400,
              key: 'voucher_expired',
              message: 'gift card expired',
              details: 'voucher has already expired',
            },
          },
          status: {} as StackableRedeemableResponseStatus,
          object: {} as StackableRedeemableObject,
        },
      ],
    };

    // Act and Assert
    expect(() => converter.convert(argument)).toThrowError('voucher has already expired');
  });

  test('convert invalid - no key gift card response', () => {
    const argument: ValidationValidateStackableResponse = {
      stacking_rules: {} as ValidationsStackingRules,
      valid: false,
      redeemables: [
        {
          id: 'some',
          result: {
            error: {
              code: 400,
              message: 'An error happened',
            },
          },
          status: {} as StackableRedeemableResponseStatus,
          object: {} as StackableRedeemableObject,
        },
      ],
    };

    // Act and Assert
    expect(() => converter.convert(argument)).toThrowError('An error happened');
  });

  test('convert invalid - not found gift card response', () => {
    const argument: ValidationValidateStackableResponse = {
      stacking_rules: {} as ValidationsStackingRules,
      valid: false,
      redeemables: [
        {
          id: 'some',
          result: {
            error: {
              code: 404,
              key: 'not_found',
              message: 'Resource not found',
              details: 'voucher with given code does not exist',
            },
          },
          status: {} as StackableRedeemableResponseStatus,
          object: {} as StackableRedeemableObject,
        },
      ],
    };

    // Act and Assert
    expect(() => converter.convert(argument)).toThrowError('voucher with given code does not exist');
  });
});
