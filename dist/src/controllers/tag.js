"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag = exports.getTag = exports.getTags = exports.createTag = void 0;
const callbacks_1 = require("@/handlers/callbacks");
const tag_1 = require("@/handlers/Db/tag");
const AppError_1 = require("@/handlers/Errors/AppError");
const Tags_1 = require("@/types/Tags");
exports.createTag = (0, callbacks_1.asyncHandler)(async (req, res, next) => {
    const tag = Tags_1.Tag.omit({ user: true }).parse(req.body);
    const existTag = await tag_1.TagHandler.findOne({
        name: tag.name,
        user: req.user._id,
    });
    if (existTag)
        return next(new AppError_1.AppError("Tag already exist", 400));
    const createdTag = await tag_1.TagHandler.create({ ...tag, user: req.user._id });
    res.json({ tag: createdTag });
});
exports.getTags = (0, callbacks_1.asyncHandler)(async (req, res) => {
    const tags = await tag_1.TagHandler.find({ user: req.user._id });
    res.json({ tags });
});
exports.getTag = (0, callbacks_1.asyncHandler)(async (req, res) => {
    const tagId = req.params.tagId;
    const tag = await tag_1.TagHandler.findOne({ _id: tagId });
    res.json({ tag });
});
exports.deleteTag = (0, callbacks_1.asyncHandler)(async (req, res, next) => {
    const tagId = req.params.tagId;
    const tag = await tag_1.TagHandler.findOne({ _id: tagId });
    if (!tag)
        return next(new AppError_1.AppError("Tag doesn't exist", 404));
    if (tag?.user?.toString() !== req.user?._id?.toString())
        return next(new AppError_1.AppError("Tag not owned", 401));
    const deleted = await tag_1.TagHandler.delete({ _id: tagId });
    res.json({ deleted });
});
// COMING SOON: explore tags
