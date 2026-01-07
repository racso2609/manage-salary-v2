"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combinedAuth = void 0;
const apiKeyAuth_1 = require("./apiKeyAuth");
const passport_1 = __importDefault(require("passport"));
exports.combinedAuth = [passport_1.default.authenticate("bearer", { session: false }), apiKeyAuth_1.apiKeyAuth];
