"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("@/types/Db/user");
const mongoose_1 = require("mongoose");
const mongoose_bcrypt_1 = __importDefault(require("mongoose-bcrypt"));
const userSchema = new mongoose_1.Schema({
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    token: {
        type: String,
    },
    roles: {
        type: [
            {
                type: String,
                enum: Object.values(user_1.ROLES),
            },
        ],
        required: true,
        default: [user_1.ROLES.USER],
    },
}, { timestamps: true });
userSchema.plugin(mongoose_bcrypt_1.default);
exports.default = (0, mongoose_1.model)("User", userSchema);
