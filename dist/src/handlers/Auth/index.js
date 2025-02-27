"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = __importDefault(require("@/env"));
const user_1 = require("@/types/Db/user");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthHandler {
    constructor(secret = env_1.default.JWT_SECRET) {
        this.secret = secret;
    }
    getToken(user) {
        const userData = user_1.User.omit({ password: true }).parse(user);
        return jsonwebtoken_1.default.sign({ userName: userData.userName }, this.secret, {
            expiresIn: "7d",
        });
    }
    validateToken(token) {
        const data = jsonwebtoken_1.default.verify(token, this.secret);
        return !!data;
    }
    decodeToken(token) {
        return jsonwebtoken_1.default.verify(token, this.secret);
    }
    getTokenStatus(token) {
        const tokenData = jsonwebtoken_1.default.verify(token, this.secret);
        if (!tokenData.exp)
            throw new Error("Invalid token");
        const expireIn = tokenData.exp * 1000 - Date.now();
        const expired = !expireIn;
        return {
            expired,
            expireIn,
        };
    }
}
exports.default = new AuthHandler();
