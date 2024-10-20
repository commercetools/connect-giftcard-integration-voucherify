import { Static, Type } from '@sinclair/typebox';

/**
 * Represents https://docs.commercetools.com/api/errors#errorobject
 */
export const ErrorObject = Type.Object(
  {
    code: Type.String(),
    message: Type.String(),
  },
  { additionalProperties: true },
);

/**
 * Represents https://docs.commercetools.com/api/errors#errorresponse
 */
export const ErrorResponse = Type.Object({
  statusCode: Type.Integer(),
  message: Type.String(),
  errors: Type.Array(ErrorObject),
});

/**
 * Represents https://docs.commercetools.com/api/errors#autherrorresponse
 */
export const AuthErrorResponse = Type.Composite([
  ErrorResponse,
  Type.Object({
    error: Type.String(),
    error_description: Type.Optional(Type.String()),
  }),
]);

export const VoucherifyCustomErrorResponse = Type.Object({
  status: Type.Object({
    state: Type.String(),
    errors: Type.Optional(Type.Array(ErrorObject)),
  }),
  amount: Type.Optional(
    Type.Object({
      centAmount: Type.Integer(),
      currencyCode: Type.String(),
    }),
  ),
});

export type TErrorObject = Static<typeof ErrorObject>;
export type TErrorResponse = Static<typeof ErrorResponse>;
export type TAuthErrorResponse = Static<typeof AuthErrorResponse>;
export type TVoucherifyCustomErrorResponse = Static<typeof VoucherifyCustomErrorResponse>;
