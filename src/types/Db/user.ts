import { z } from "zod";

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
  token: z.string(),
  roles: ROLE.array().default([ROLES.USER]),
});

export type User = z.infer<typeof User>;
