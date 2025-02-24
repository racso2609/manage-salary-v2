import { Router } from "express";
import authRouter from "./auth";
import inOutRecordRouter from "./inOutRecords";
import tagRouter from "./tag";

const router = Router();

router.use("/auth", authRouter);
router.use("/records", inOutRecordRouter);
router.use("/tags", tagRouter);

export default router;
