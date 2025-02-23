import { DbTestDescribe } from "./utils/describes";
import { UsersHandler } from "@/handlers/Db/users";
import { fetcher } from "./utils/fetchers";
import { ALICE, BOB } from "./constants/users";
import { describe, beforeEach, expect, test } from "vitest";
import { createUser, login } from "./utils/users";
import { User } from "@/types/Db/user";

DbTestDescribe("Authentication", () => {
  beforeEach(async () => {
    await UsersHandler.deleteMany({});
  });

  describe("signup", () => {
    test("signup: revert: missing params", async () => {
      const response = await fetcher
        .post("/api/auth/signup")
        .send({ email: ALICE.email });

      expect(response.statusCode).toBe(500);
    });

    test("signup", async () => {
      const response = await createUser(ALICE);
      expect(response.statusCode).toBe(200);
      const user = response.body.user as User;

      expect(user.userName).toBe(ALICE.userName);
      expect(user.email).toBe(ALICE.email);
      expect(user.password).toBeDefined();

      const dbUser = await UsersHandler.findOne({ email: ALICE.email });

      expect(dbUser?.password !== ALICE.password);
      expect(await dbUser?.verifyPassword?.(ALICE.password)).toBe(true);
    });

    test("signup: revert: user email already exist", async () => {
      await createUser(ALICE);
      const response = await createUser({ ...BOB, email: ALICE.email });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("User already exist!");
    });

    test("signup: revert: user userName already exist", async () => {
      await createUser(ALICE);

      const response = await createUser({ ...BOB, userName: ALICE.userName });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("User already exist!");
    });
  });
  describe("Login", () => {
    test("login: revert user not found", async () => {
      const response = await login(ALICE);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid email or password");
    });

    test("login: invalid email or password", async () => {
      await createUser(ALICE);
      const response = await login({ ...ALICE, password: "wrong" });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid email or password");
    });

    test("login", async () => {
      await createUser(ALICE);
      const response = await login(ALICE);

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    test("status: invalid token", async () => {
      await createUser(ALICE);

      const response = await fetcher.get("/api/auth/status");
      expect(response.statusCode).toBe(401);
    });

    test("status", async () => {
      await createUser(ALICE);
      const loginResponse = await login(ALICE);
      const token = loginResponse.body.token;

      const response = await fetcher
        .get("/api/auth/status")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.expired).toBe(false);
      expect(response.body.expireIn).toBeGreaterThan(0);
    });
  });
});
