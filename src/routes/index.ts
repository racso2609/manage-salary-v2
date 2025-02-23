import { Router } from "express";
import authRouter from "./auth";
import inOutRecordRouter from "./inOutRecords";

const router = Router();

router.use("/auth", authRouter);
router.use("/in-out-records", inOutRecordRouter);

export default router;
