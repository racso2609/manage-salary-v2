"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.createUser = void 0;
const fetchers_1 = require("./fetchers");
const createUser = async (user) => {
    const response = await fetchers_1.fetcher.post("/api/auth/signup").send(user);
    return response;
};
exports.createUser = createUser;
const login = async (user) => {
    const response = await fetchers_1.fetcher
        .post("/api/auth/login")
        .send({ email: user.email, password: user.password });
    return response;
};
exports.login = login;
