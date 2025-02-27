"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = exports.User = exports.ROLE = exports.ROLES = void 0;
const zod_1 = require("zod");
var ROLES;
(function (ROLES) {
    ROLES["ADMIN"] = "admin";
    ROLES["USER"] = "user";
})(ROLES || (exports.ROLES = ROLES = {}));
exports.ROLE = zod_1.z.nativeEnum(ROLES);
exports.User = zod_1.z.object({
    userName: zod_1.z.string(),
    email: zod_1.z.string().email(),
    // TODO: add regex validation
    password: zod_1.z.string(),
    token: zod_1.z.string().default(""),
    roles: exports.ROLE.array().default([ROLES.USER]),
    verifyPassword: zod_1.z.function().optional(),
});
exports.Token = zod_1.z.object({
    _id: zod_1.z.string(),
});
