import { asyncHandler } from "@/handlers/callbacks";
import InOutRecordHandler from "@/handlers/Db/inOutRecord";
import { TagHandler } from "@/handlers/Db/tag";
import { AppError } from "@/handlers/Errors/AppError";
import { AuthenticatedRequest } from "@/types/Db/user";
import { InOutRecord, InOutRecordType } from "@/types/InOut";
import { NextFunction, Response } from "express";
import { z } from "zod";

export const createRecord = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const record = InOutRecord.omit({ user: true }).parse(req.body);
    const amount = Number(record.amount);
    if (!amount) return next(new AppError("Invalid amount", 400));

    const tag = await TagHandler.findOne({
      _id: record.tag,
      user: req.user._id,
    });
    if (!tag) return next(new AppError("Invalid tag", 400));

    const createdRecord = await InOutRecordHandler.create({
      ...record,
      user: req.user._id,
    });
    console.log("=== createRecord", createdRecord);

    res.json({ record: createdRecord });
  },
);

export const removeRecord = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const recordId = z.string().parse(req.params.recordId);

    const record = await InOutRecordHandler.findOne({ _id: recordId });
    if (!record) return next(new AppError("Record doesnt exist", 404));

    if (record?.user?.toString() !== req?.user?._id?.toString())
      return next(new AppError("Record not owned", 401));

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
        sort: { createdAt: -1 },
        populates: [{ path: "tag", unique: true }],
      },
    );

    const total = records.reduce((acc, data) => {
      if (data._id === "in") acc += data.total;
      else acc -= data.total;

      return acc;
    }, 0);

    res.json({
      records,
      total,
    });
  },
);

export const getInOutRecords = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.user?._id?.toString();

    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 0;
    const recordType = InOutRecordType.optional().parse(req.query.recordType);
    const tag = z.string().optional().parse(req.query.tag);

    let query: Partial<InOutRecord> = { user: userId };
    if (recordType) query = { ...query, type: recordType };
    if (tag) query = { ...query, tag };

    const records = await InOutRecordHandler.find(query, {
      limit,
      offset: page * limit,
      sort: { createdAt: -1 },
      populates: [
        {
          path: "tag",
          unique: true,
        },
      ],
    });

    res.json({ records });
  },
);
