import { z } from "zod";

export const ENVIRONMENTS = z.enum(["prod", "dev", "test"]);
export type ENVIRONMENTS = z.infer<typeof ENVIRONMENTS>;

export const ENV = z.object({
  // server
  NODE_ENV: ENVIRONMENTS,
  PORT: z.preprocess((arg) => Number(arg), z.number()).default(3001),
  REQUEST_PER_HOUR: z.preprocess((arg) => Number(arg), z.number()).default(150),
  JWT_SECRET: z.string(),
  API_KEY_SECRET: z.string(),

  // DB
  MONGO_URI: z.string(),
});
export type ENV = z.infer<typeof ENV>;
