"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inOutRecord_1 = require("../controllers/inOutRecord");
const authentication_1 = require("../middlewares/authentication");
const combinedAuth_1 = require("../middlewares/combinedAuth");
const express_1 = require("express");
const inOutRecordRouter = (0, express_1.Router)();
inOutRecordRouter
    .route("/")
    .get(authentication_1.protect, inOutRecord_1.getInOutRecords)
    .post(combinedAuth_1.combinedAuth, inOutRecord_1.createRecord);
inOutRecordRouter.post("/bulk", combinedAuth_1.combinedAuth, inOutRecord_1.createRecords);
inOutRecordRouter.get("/dashboard", authentication_1.protect, inOutRecord_1.getDashboardInfo);
inOutRecordRouter.get("/analytics", authentication_1.protect, inOutRecord_1.getAnalytics);
inOutRecordRouter
    .route("/:recordId")
    .put(authentication_1.protect, inOutRecord_1.updateRecord)
    .delete(authentication_1.protect, inOutRecord_1.removeRecord);
exports.default = inOutRecordRouter;
