"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combinedAuth = void 0;
const apiKeyAuth_1 = require("./apiKeyAuth");
const passport_1 = __importDefault(require("passport"));
const combinedAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers['x-api-key'];
    if (authHeader) {
        // Use bearer validation
        passport_1.default.authenticate("bearer", { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (user) {
                req.user = user;
                return next();
            }
            else {
                res.status(401).json({ error: "Invalid bearer token" });
                return;
            }
        })(req, res, next);
    }
    else if (apiKeyHeader) {
        // Use apiKeyAuth
        (0, apiKeyAuth_1.apiKeyAuth)(req, res, () => {
            if (req.user) {
                return next();
            }
            else {
                res.status(401).json({ error: "Invalid API key" });
                return;
            }
        });
    }
    else {
        res.status(401).json({ error: "No authentication provided" });
        return;
    }
};
exports.combinedAuth = combinedAuth;
