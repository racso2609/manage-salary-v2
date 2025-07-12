"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagInfo = exports.deleteTag = exports.getTag = exports.getTags = exports.createTag = void 0;
const callbacks_1 = require("../handlers/callbacks");
const inOutRecord_1 = __importDefault(require("../handlers/Db/inOutRecord"));
const tag_1 = require("../handlers/Db/tag");
const AppError_1 = require("../handlers/Errors/AppError");
const Tags_1 = require("../types/Tags");
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
exports.tagInfo = (0, callbacks_1.asyncHandler)(async (req, res) => {
    const tagId = req.params.tagId;
    const tag = await tag_1.TagHandler.findOne({ _id: tagId, user: req.user._id });
    if (!tag)
        return res.status(404).json({ message: "Tag not found" });
    const initDate = req.query.initDate;
    const endDate = req.query.endDate || Date.now();
    const dateFilter = {};
    if (initDate && endDate) {
        dateFilter.createdAt = {
            $gte: new Date(initDate),
            $lte: new Date(endDate),
        };
    }
    const records = await inOutRecord_1.default.find({
        user: req.user._id,
        tag: tagId,
        ...dateFilter,
    }, {
        group: {
            _id: "$type",
            records: { $push: "$$ROOT" },
            counter: { $sum: 1 },
            total: { $sum: "$amount" },
        },
        sort: { createdAt: -1 },
        populates: [{ path: "tag", unique: true }],
    });
    const total = records.reduce((acc, data) => {
        if (data._id === "in")
            acc += data.total;
        else
            acc -= data.total;
        return acc;
    }, 0);
    const recordsNotGrouped = await inOutRecord_1.default.find({
        user: req.user._id,
        tag: tagId,
        ...dateFilter,
    }, {
        sort: { createdAt: -1 },
        populates: [{ path: "tag", unique: true }],
    });
    res.json({
        tag,
        recordsGrouped: records,
        total,
        records: recordsNotGrouped,
    });
});
// COMING SOON: explore tags
