"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inOutRecord_1 = require("../controllers/inOutRecord");
const authentication_1 = require("../middlewares/authentication");
const express_1 = require("express");
const inOutRecordRouter = (0, express_1.Router)();
inOutRecordRouter
    .route("/")
    .get(authentication_1.protect, inOutRecord_1.getInOutRecords)
    .post(authentication_1.protect, inOutRecord_1.createRecord);
inOutRecordRouter.get("/dashboard", authentication_1.protect, inOutRecord_1.getDashboardInfo);
inOutRecordRouter.delete("/:recordId", authentication_1.protect, inOutRecord_1.removeRecord);
exports.default = inOutRecordRouter;
