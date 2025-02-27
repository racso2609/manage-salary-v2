"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const env_1 = require("./types/env");
(0, dotenv_1.configDotenv)({
    path: `.env.${process.env.NODE_ENV}`,
    debug: process.env.NODE_ENV !== "prod",
});
const environment = env_1.ENV.parse({
    ...process.env,
});
exports.default = environment;
