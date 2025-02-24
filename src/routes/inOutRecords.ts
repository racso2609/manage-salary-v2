import {
  createRecord,
  getDashboardInfo,
  getInOutRecords,
  removeRecord,
} from "@/controllers/inOutRecord";
import { protect } from "@/middlewares/authentication";
import { Router } from "express";

const inOutRecordRouter = Router();

inOutRecordRouter
  .route("/")
  .get(protect, getInOutRecords)
  .post(protect, createRecord);
inOutRecordRouter.get("/dashboard", protect, getDashboardInfo);
inOutRecordRouter.delete("/:recordId", protect, removeRecord);

export default inOutRecordRouter;
