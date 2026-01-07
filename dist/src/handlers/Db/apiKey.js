"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyHandler = void 0;
const _1 = require(".");
const apiKey_1 = __importDefault(require("../../models/apiKey"));
const crypto_1 = __importDefault(require("crypto"));
class ApiKeyDbHandler extends _1.DbRepository {
    constructor() {
        super(apiKey_1.default);
    }
    generateKey() {
        const plain = crypto_1.default.randomBytes(32).toString("hex");
        const hash = crypto_1.default.createHash("sha256").update(plain).digest("hex");
        return { plain, hash };
    }
    async createApiKey(data) {
        return super.create(data);
    }
    findByUser(userId) {
        return this.find({ user: userId, active: true });
    }
    async findByHashedKey(hashedKey) {
        return await this.findOne({ key: hashedKey, active: true });
    }
}
exports.ApiKeyHandler = new ApiKeyDbHandler();
