"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = __importDefault(require("./env"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const morgan_1 = __importDefault(require("morgan"));
const Loggers_1 = require("./handlers/Loggers");
const globalErrorHandler_1 = require("./middlewares/globalErrorHandler");
const routes_1 = __importDefault(require("./routes"));
require("./utils/serialization");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, express_mongo_sanitize_1.default)());
// Log requests to the console and write to file
app.use((0, morgan_1.default)("dev"));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
});
app.use(limiter);
app.use("/api", routes_1.default);
app.use(globalErrorHandler_1.globalErrorController);
app.listen(env_1.default.PORT, () => {
    Loggers_1.logger.log(`Server listening on port: ${env_1.default.PORT}`);
});
exports.default = app;
