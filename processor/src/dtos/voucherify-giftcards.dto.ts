import { Static, Type } from '@sinclair/typebox';
import { AmountSchema } from './operations/payment-intents.dto';

export const ErrorSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
});

const StatusSchema = Type.Object({
  state: Type.String(),
  errors: Type.Optional(ErrorSchema),
});

export const BalanceResponseSchema = Type.Object({
  status: StatusSchema,
  amount: AmountSchema,
});

export const RedeemRequestSchema = Type.Object({
  code: Type.String(),
  redeemAmount: AmountSchema,
});

export const RedeemResponseSchema = Type.Object({
  result: Type.String(),
  paymentReference: Type.String(),
  redemptionId: Type.String(),
});

export type RedeemRequestDTO = Static<typeof RedeemRequestSchema>;
export type RedeemResponseDTO = Static<typeof RedeemResponseSchema>;

export type BalanceResponseSchemaDTO = Static<typeof BalanceResponseSchema>;
