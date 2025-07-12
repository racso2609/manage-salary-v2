import { asyncHandler } from "@/handlers/callbacks";
import InOutRecordHandler from "@/handlers/Db/inOutRecord";
import { TagHandler } from "@/handlers/Db/tag";
import { AppError } from "@/handlers/Errors/AppError";
import { AuthenticatedRequest } from "@/types/Db/user";
import { InOutRecord } from "@/types/InOut";
import { Tag } from "@/types/Tags";
import { NextFunction, Response } from "express";
import { FilterQuery } from "mongoose";

export const createTag = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const tag = Tag.omit({ user: true }).parse(req.body);

    const existTag = await TagHandler.findOne({
      name: tag.name,
      user: req.user._id,
    });

    if (existTag) return next(new AppError("Tag already exist", 400));

    const createdTag = await TagHandler.create({ ...tag, user: req.user._id });

    res.json({ tag: createdTag });
  },
);

export const getTags = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const tags = await TagHandler.find({ user: req.user._id });

    res.json({ tags });
  },
);

export const getTag = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const tagId = req.params.tagId;
    const tag = await TagHandler.findOne({ _id: tagId });

    res.json({ tag });
  },
);

export const deleteTag = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const tagId = req.params.tagId;
    const tag = await TagHandler.findOne({ _id: tagId });
    if (!tag) return next(new AppError("Tag doesn't exist", 404));

    if (tag?.user?.toString() !== req.user?._id?.toString())
      return next(new AppError("Tag not owned", 401));

    const deleted = await TagHandler.delete({ _id: tagId });

    res.json({ deleted });
  },
);

export const tagInfo = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const tagId = req.params.tagId;
    const tag = await TagHandler.findOne({ _id: tagId, user: req.user._id });
    if (!tag) return res.status(404).json({ message: "Tag not found" });

    const initDate = req.query.initDate;
    const endDate = req.query.endDate || Date.now();

    const dateFilter: FilterQuery<InOutRecord> = {};

    if (initDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(initDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const records = await InOutRecordHandler.find(
      {
        user: req.user._id,
        tag: tagId,
        ...dateFilter,
      },
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

    const recordsNotGrouped = await InOutRecordHandler.find(
      {
        user: req.user._id,
        tag: tagId,
        ...dateFilter,
      },
      {
        sort: { createdAt: -1 },
        populates: [{ path: "tag", unique: true }],
      },
    );

    res.json({
      tag,
      recordsGrouped: records,
      total,
      records: recordsNotGrouped,
    });
  },
);

// COMING SOON: explore tags
