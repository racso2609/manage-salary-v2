"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagHandler = void 0;
const _1 = require(".");
const tag_1 = __importDefault(require("@/models/tag"));
exports.TagHandler = new _1.DbRepository(tag_1.default);
