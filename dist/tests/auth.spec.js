"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const describes_1 = require("./utils/describes");
const users_1 = require("@/handlers/Db/users");
const fetchers_1 = require("./utils/fetchers");
const users_2 = require("./constants/users");
const vitest_1 = require("vitest");
const users_3 = require("./utils/users");
(0, describes_1.DbTestDescribe)("Authentication", () => {
    (0, vitest_1.beforeEach)(async () => {
        await users_1.UsersHandler.deleteMany({});
    });
    (0, vitest_1.describe)("signup", () => {
        (0, vitest_1.test)("signup: revert: missing params", async () => {
            const response = await fetchers_1.fetcher
                .post("/api/auth/signup")
                .send({ email: users_2.ALICE.email });
            (0, vitest_1.expect)(response.statusCode).toBe(500);
        });
        (0, vitest_1.test)("signup", async () => {
            const response = await (0, users_3.createUser)(users_2.ALICE);
            (0, vitest_1.expect)(response.statusCode).toBe(200);
            const user = response.body.user;
            (0, vitest_1.expect)(user.userName).toBe(users_2.ALICE.userName);
            (0, vitest_1.expect)(user.email).toBe(users_2.ALICE.email);
            (0, vitest_1.expect)(user.password).toBeDefined();
            const dbUser = await users_1.UsersHandler.findOne({ email: users_2.ALICE.email });
            (0, vitest_1.expect)(dbUser?.password !== users_2.ALICE.password);
            (0, vitest_1.expect)(await dbUser?.verifyPassword?.(users_2.ALICE.password)).toBe(true);
        });
        (0, vitest_1.test)("signup: revert: user email already exist", async () => {
            await (0, users_3.createUser)(users_2.ALICE);
            const response = await (0, users_3.createUser)({ ...users_2.BOB, email: users_2.ALICE.email });
            (0, vitest_1.expect)(response.statusCode).toBe(400);
            (0, vitest_1.expect)(response.body.message).toBe("User already exist!");
        });
        (0, vitest_1.test)("signup: revert: user userName already exist", async () => {
            await (0, users_3.createUser)(users_2.ALICE);
            const response = await (0, users_3.createUser)({ ...users_2.BOB, userName: users_2.ALICE.userName });
            (0, vitest_1.expect)(response.statusCode).toBe(400);
            (0, vitest_1.expect)(response.body.message).toBe("User already exist!");
        });
    });
    (0, vitest_1.describe)("Login", () => {
        (0, vitest_1.test)("login: revert user not found", async () => {
            const response = await (0, users_3.login)(users_2.ALICE);
            (0, vitest_1.expect)(response.statusCode).toBe(400);
            (0, vitest_1.expect)(response.body.message).toBe("Invalid email or password");
        });
        (0, vitest_1.test)("login: invalid email or password", async () => {
            await (0, users_3.createUser)(users_2.ALICE);
            const response = await (0, users_3.login)({ ...users_2.ALICE, password: "wrong" });
            (0, vitest_1.expect)(response.statusCode).toBe(400);
            (0, vitest_1.expect)(response.body.message).toBe("Invalid email or password");
        });
        (0, vitest_1.test)("login", async () => {
            await (0, users_3.createUser)(users_2.ALICE);
            const response = await (0, users_3.login)(users_2.ALICE);
            (0, vitest_1.expect)(response.statusCode).toBe(200);
            (0, vitest_1.expect)(response.body.token).toBeDefined();
        });
        (0, vitest_1.test)("status: invalid token", async () => {
            await (0, users_3.createUser)(users_2.ALICE);
            const response = await fetchers_1.fetcher.get("/api/auth/status");
            (0, vitest_1.expect)(response.statusCode).toBe(401);
        });
        (0, vitest_1.test)("status", async () => {
            await (0, users_3.createUser)(users_2.ALICE);
            const loginResponse = await (0, users_3.login)(users_2.ALICE);
            const token = loginResponse.body.token;
            const response = await fetchers_1.fetcher
                .get("/api/auth/status")
                .set("Authorization", `Bearer ${token}`);
            (0, vitest_1.expect)(response.statusCode).toBe(200);
            (0, vitest_1.expect)(response.body.expired).toBe(false);
            (0, vitest_1.expect)(response.body.expireIn).toBeGreaterThan(0);
        });
    });
});
