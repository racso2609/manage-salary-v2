"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyResponse = exports.CreateApiKey = exports.ApiKey = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
exports.ApiKey = zod_1.z.object({
    user: zod_1.z.instanceof(mongoose_1.Types.ObjectId), // ObjectId
    name: zod_1.z.string(),
    key: zod_1.z.string(),
    permissions: zod_1.z.array(zod_1.z.string()).default(["create_records"]),
    expiresAt: zod_1.z.date().optional(),
    active: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.CreateApiKey = zod_1.z.object({
    name: zod_1.z.string(),
    permissions: zod_1.z.array(zod_1.z.string()).default(["create_records"]),
    expiresAt: zod_1.z.string().optional(), // ISO string
});
exports.ApiKeyResponse = zod_1.z.object({
    _id: zod_1.z.string(),
    name: zod_1.z.string(),
    permissions: zod_1.z.array(zod_1.z.string()),
    expiresAt: zod_1.z.date().optional(),
    active: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
