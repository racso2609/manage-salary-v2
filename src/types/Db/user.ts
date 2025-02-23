import { z } from "zod";
import { Request } from "express";

export enum ROLES {
  ADMIN = "admin",
  USER = "user",
}
export const ROLE = z.nativeEnum(ROLES);

export const User = z.object({
  userName: z.string(),
  email: z.string().email(),
  // TODO: add regex validation
  password: z.string(),
  token: z.string().default(""),
  roles: ROLE.array().default([ROLES.USER]),
  verifyPassword: z.function().optional(),
});

export type User = z.infer<typeof User>;

export const Token = z.object({
  _id: z.string(),
});

export type Token = z.infer<typeof Token>;

export type AuthenticatedRequest = Request & { user: User };
