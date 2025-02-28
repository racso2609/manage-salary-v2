"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const users_1 = require("../handlers/Db/users");
const passport_1 = __importDefault(require("passport"));
const passport_http_bearer_1 = require("passport-http-bearer");
const Auth_1 = __importDefault(require("../handlers/Auth"));
passport_1.default.use(new passport_http_bearer_1.Strategy(async function (token, done) {
    try {
        const isValidToken = Auth_1.default.validateToken(token);
        if (!isValidToken)
            return done(null, false);
        const user = await users_1.UsersHandler.findOne({ token: token });
        if (!user)
            return done(null, false);
        return done(null, user, { scope: "all" });
    }
    catch (error) {
        return done(error);
    }
}));
exports.protect = passport_1.default.authenticate("bearer", { session: false });
