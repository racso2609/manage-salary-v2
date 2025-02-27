"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("@/controllers/auth");
const authentication_1 = require("@/middlewares/authentication");
const express_1 = require("express");
const authRouter = (0, express_1.Router)();
authRouter.post("/login", auth_1.login);
authRouter.post("/signup", auth_1.signup);
authRouter.get("/refresh", authentication_1.protect, auth_1.refreshToken);
authRouter.get("/status", authentication_1.protect, auth_1.tokenStatus);
exports.default = authRouter;
