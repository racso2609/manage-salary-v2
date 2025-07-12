import { asyncHandler } from "@/handlers/callbacks";
import InOutRecordHandler from "@/handlers/Db/inOutRecord";
import { TagHandler } from "@/handlers/Db/tag";
import { AppError } from "@/handlers/Errors/AppError";
import { AuthenticatedRequest } from "@/types/Db/user";
import {
  IN_OUT_RECORD_TYPES,
  InOutRecord,
  InOutRecordType,
} from "@/types/InOut";
import { NextFunction, Response } from "express";
import { FilterQuery } from "mongoose";
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
    const tag = z.string().optional().parse(req.query.tag);
    const from = z.string().optional().parse(req.query.from);
    const to = z.string().optional().parse(req.query.to);

    const query = {
      user: userId,
    };

    if (tag) query["tag"] = tag;
    if (from && to) {
      query["createdAt"] = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const recordsByDate = await InOutRecordHandler.find(query, {
      group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        records: { $push: "$$ROOT" },
        counter: { $sum: 1 },
        // if record is type "in", sum amount, else sum negative amount
        total: {
          $sum: {
            $cond: [
              { $eq: ["$type", "in"] },
              "$amount",
              { $multiply: ["$amount", -1] },
            ],
          },
        },
      },
      sort: { createdAt: -1 },
      populates: [{ path: "tag", unique: true }],
    });

    const total = recordsByDate.reduce((acc, record) => {
      return acc + record.total;
    }, 0);

    const records = await InOutRecordHandler.find(query);

    const totalIn = records.reduce((acc, record) => {
      return acc + (record.type === "in" ? record.amount : 0);
    }, 0);

    const totalOut = records.reduce((acc, record) => {
      return acc + (record.type === "out" ? record.amount : 0);
    }, 0);

    res.json({
      records: recordsByDate.sort((a, b) => {
        return new Date(b._id).getTime() - new Date(a._id).getTime();
      }),
      total,
      totalIn,
      totalOut,
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
    const from = z.string().optional().parse(req.query.from);
    const to = z.string().optional().parse(req.query.to);

    let query: FilterQuery<InOutRecord> = { user: userId };
    if (recordType) query = { ...query, type: recordType };
    if (tag) query = { ...query, tag };

    if (from && to)
      query = {
        ...query,
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
      };

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
