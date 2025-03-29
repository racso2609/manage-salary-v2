"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InOutRecordType = exports.InOutRecord = exports.IN_OUT_RECORD_TYPES = void 0;
const zod_1 = require("zod");
exports.IN_OUT_RECORD_TYPES = ["in", "out"];
exports.InOutRecord = zod_1.z.object({
    // amount incoming if currency is usd 2 zeros for decimals
    amount: zod_1.z.preprocess((a) => BigInt(a?.toString() || 0), zod_1.z.bigint()),
    type: zod_1.z.enum(exports.IN_OUT_RECORD_TYPES),
    currency: zod_1.z.preprocess((a) => a?.toString().toUpperCase(), zod_1.z.string()),
    user: zod_1.z.unknown(),
    description: zod_1.z.string(),
    tag: zod_1.z.unknown(),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
});
exports.InOutRecordType = zod_1.z.enum(exports.IN_OUT_RECORD_TYPES);
