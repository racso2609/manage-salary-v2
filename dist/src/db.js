"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = __importDefault(require("./env"));
const Loggers_1 = require("./handlers/Loggers");
mongoose_1.default
    .connect(env_1.default.MONGO_URI)
    .then(() => {
    Loggers_1.logger.log("Mongo connected");
})
    .catch(Loggers_1.logger.error);
