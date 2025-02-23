import { z } from "zod";

export const IN_OUT_RECORD_TYPES = ["in", "out"] as const;

export const InOutRecord = z.object({
  // amount incoming
  amount: z.string(),
  type: z.enum(IN_OUT_RECORD_TYPES),
  currency: z.string(),
  user: z.unknown(),
  description: z.string(),
  tag: z.unknown(),
});

export type InOutRecord = z.infer<typeof InOutRecord>;
