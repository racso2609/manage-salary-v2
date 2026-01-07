import { z } from "zod";

export const IN_OUT_RECORD_TYPES = ["in", "out"] as const;

export const InOutRecord = z.object({
  // amount incoming if currency is usd 2 zeros for decimals
  amount: z.preprocess((a) => BigInt(a?.toString() || 0), z.bigint()),
  type: z.enum(IN_OUT_RECORD_TYPES),
  currency: z.preprocess((a) => a?.toString().toUpperCase(), z.string()),
  user: z.unknown(),
  description: z.string(),
  tag: z.unknown(),
  date: z.date(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type InOutRecord = z.infer<typeof InOutRecord>;

export const InOutRecordType = z.enum(IN_OUT_RECORD_TYPES);
export type InOutRecordType = z.infer<typeof InOutRecordType>;
