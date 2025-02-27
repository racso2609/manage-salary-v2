"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const inOutRecords_1 = __importDefault(require("./inOutRecords"));
const tag_1 = __importDefault(require("./tag"));
const router = (0, express_1.Router)();
router.use("/auth", auth_1.default);
router.use("/records", inOutRecords_1.default);
router.use("/tags", tag_1.default);
exports.default = router;
