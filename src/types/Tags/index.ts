import { z } from "zod";

export const Tag = z.object({
  name: z.string(),
  user: z.unknown(),
});

export type Tag = z.infer<typeof Tag>;
