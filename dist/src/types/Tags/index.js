"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tag = void 0;
const zod_1 = require("zod");
exports.Tag = zod_1.z.object({
    name: zod_1.z.string(),
    user: zod_1.z.unknown(),
});
