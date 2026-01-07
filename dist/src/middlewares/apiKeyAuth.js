"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyAuth = void 0;
const apiKey_1 = require("../handlers/Db/apiKey");
const users_1 = require("../handlers/Db/users");
const crypto_1 = __importDefault(require("crypto"));
const apiKeyAuth = async (req, res, next) => {
    try {
        const apiKey = req.headers["x-api-key"];
        if (!apiKey)
            return next();
        const hashed = crypto_1.default.createHash("sha256").update(apiKey).digest("hex");
        const apiKeyDoc = await apiKey_1.ApiKeyHandler.findByHashedKey(hashed);
        if (!apiKeyDoc)
            return next();
        if (apiKeyDoc.expiresAt && new Date() > apiKeyDoc.expiresAt)
            return next();
        const user = await users_1.UsersHandler.findOne({ _id: apiKeyDoc.user });
        if (!user)
            return next();
        req.user = user;
        next();
    }
    catch (error) {
        next();
    }
};
exports.apiKeyAuth = apiKeyAuth;
