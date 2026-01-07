"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = exports.ENVIRONMENTS = void 0;
const zod_1 = require("zod");
exports.ENVIRONMENTS = zod_1.z.enum(["prod", "dev", "test"]);
exports.ENV = zod_1.z.object({
    // server
    NODE_ENV: exports.ENVIRONMENTS,
    PORT: zod_1.z.preprocess((arg) => Number(arg), zod_1.z.number()).default(3001),
    REQUEST_PER_HOUR: zod_1.z.preprocess((arg) => Number(arg), zod_1.z.number()).default(150),
    JWT_SECRET: zod_1.z.string(),
    API_KEY_SECRET: zod_1.z.string(),
    // DB
    MONGO_URI: zod_1.z.string(),
});
