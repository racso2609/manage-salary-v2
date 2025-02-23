import { asyncHandler } from "@/handlers/callbacks";
import { TagHandler } from "@/handlers/Db/tag";
import { AppError } from "@/handlers/Errors/AppError";
import { AuthenticatedRequest } from "@/types/Db/user";
import { Tag } from "@/types/Tags";
import { NextFunction, Response } from "express";

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

// COMING SOON: explore tags
