import {
  createRecord,
  createRecords,
  getAnalytics,
  getDashboardData,
  getDashboardInfo,
  getInOutRecords,
  getInsights,
  removeRecord,
  updateRecord,
} from "@/controllers/inOutRecord";
import { protect } from "@/middlewares/authentication";
import { combinedAuth } from "@/middlewares/combinedAuth";
import { Router } from "express";

const inOutRecordRouter = Router();

inOutRecordRouter
  .route("/")
  .get(protect, getInOutRecords)
  .post(combinedAuth, createRecord);
inOutRecordRouter.post("/bulk", combinedAuth, createRecords);
inOutRecordRouter.get("/dashboard", protect, getDashboardInfo);
inOutRecordRouter.get("/analytics", protect, getAnalytics);
inOutRecordRouter.get("/insights", protect, getInsights);
inOutRecordRouter.get("/dashboard-data", protect, getDashboardData);
inOutRecordRouter
  .route("/:recordId")
  .put(protect, updateRecord)
  .delete(protect, removeRecord);

export default inOutRecordRouter;
