"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorController = void 0;
const env_1 = __importDefault(require("@/env"));
const Loggers_1 = require("@/handlers/Loggers");
const sendErrorDevelopment = (error, res) => {
    Loggers_1.logger.error(error);
    res.status(error.statusCode || 500).json({
        status: error.status || "error",
        message: error.message,
        stack: error.stack,
        error,
    });
};
const sendErrorProduction = (error, res) => {
    Loggers_1.logger.error(error);
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    }
    else {
        res.status(500).json({
            status: "error",
            message: "Something went wrong!",
        });
    }
};
const globalErrorController = (error, _req, res, _next) => {
    if (env_1.default.NODE_ENV === "dev")
        sendErrorDevelopment(error, res);
    else if (env_1.default.NODE_ENV === "prod")
        sendErrorProduction(error, res);
    else
        sendErrorDevelopment(error, res);
};
exports.globalErrorController = globalErrorController;
