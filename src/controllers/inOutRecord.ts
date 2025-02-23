import { asyncHandler } from "@/handlers/callbacks";
import InOutRecordHandler from "@/handlers/Db/inOutRecord";
import { AppError } from "@/handlers/Errors/AppError";
import { AuthenticatedRequest } from "@/types/Db/user";
import { InOutRecord } from "@/types/InOut";
import { NextFunction, Response } from "express";
import { z } from "zod";

export const createRecord = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const record = InOutRecord.omit({ user: true }).parse(req.body);
    const amount = Number(record.amount);
    if (!amount) return next(new AppError("Invalid amount", 400));

    const createdRecord = await InOutRecordHandler.create({
      ...record,
      user: req.user._id,
    });

    res.json({ record: createdRecord });
  },
);

export const removeRecord = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const recordId = z.string().parse(req.params.recordId);

    const record = await InOutRecordHandler.findOne({ _id: recordId });
    if (!record) return next(new AppError("Record doesnt exist", 404));

    if (record?.user?.toString() !== req?.user?._id?.toString())
      return next(new AppError("You can't delete this record", 401));

    const deleted = await InOutRecordHandler.delete({
      _id: recordId,
      user: req.user._id,
    });

    res.json({ deleted });
  },
);

export const getDashboardInfo = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.user?._id?.toString();

    const records = await InOutRecordHandler.find(
      { user: userId },
      {
        group: {
          _id: "$type",
          records: { $push: "$$ROOT" },
          counter: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
    );

    res.json({
      ...records,
    });
  },
);

export const getInOutRecords = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.user?._id?.toString();

    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const records = await InOutRecordHandler.find(
      { user: userId },
      { limit, offset: (page - 1) * limit },
    );

    res.json({ records });
  },
);
