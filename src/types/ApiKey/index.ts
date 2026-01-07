import { z } from "zod";
import { Types } from "mongoose";

export const ApiKey = z.object({
  user: z.instanceof(Types.ObjectId), // ObjectId
  name: z.string(),
  key: z.string(),
  permissions: z.array(z.string()).default(["create_records"]),
  expiresAt: z.date().optional(),
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ApiKey = z.infer<typeof ApiKey>;

export const CreateApiKey = z.object({
  name: z.string(),
  permissions: z.array(z.string()).default(["create_records"]),
  expiresAt: z.string().optional(), // ISO string
});

export type CreateApiKey = z.infer<typeof CreateApiKey>;

export const ApiKeyResponse = z.object({
  _id: z.string(),
  name: z.string(),
  permissions: z.array(z.string()),
  expiresAt: z.date().optional(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ApiKeyResponse = z.infer<typeof ApiKeyResponse>;