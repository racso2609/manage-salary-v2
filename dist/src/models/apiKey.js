"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_bcrypt_1 = __importDefault(require("mongoose-bcrypt"));
const apiKeySchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    key: { type: String, required: true },
    permissions: {
        type: [String],
        required: true,
        default: ["create_records"],
    },
    expiresAt: { type: Date },
    active: { type: Boolean, required: true, default: true },
}, { timestamps: true });
apiKeySchema.plugin(mongoose_bcrypt_1.default);
exports.default = (0, mongoose_1.model)("ApiKey", apiKeySchema);
