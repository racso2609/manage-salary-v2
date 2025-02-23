import { User } from "@/types/Db/user";
import { fetcher } from "./fetchers";

export const createUser = async (user: Omit<User, "roles" | "token">) => {
  const response = await fetcher.post("/api/auth/signup").send(user);

  return response;
};

export const login = async (
  user: Omit<User, "roles" | "token" | "userName">,
) => {
  const response = await fetcher
    .post("/api/auth/login")
    .send({ email: user.email, password: user.password });

  return response;
};
