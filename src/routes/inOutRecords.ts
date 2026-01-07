import {
  createRecord,
  createRecords,
  getDashboardInfo,
  getInOutRecords,
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
inOutRecordRouter
  .route("/:recordId")
  .put(protect, updateRecord)
  .delete(protect, removeRecord);

export default inOutRecordRouter;
