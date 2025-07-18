"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInOutRecords = exports.getDashboardInfo = exports.removeRecord = exports.createRecord = void 0;
const callbacks_1 = require("../handlers/callbacks");
const inOutRecord_1 = __importDefault(require("../handlers/Db/inOutRecord"));
const tag_1 = require("../handlers/Db/tag");
const AppError_1 = require("../handlers/Errors/AppError");
const InOut_1 = require("../types/InOut");
const zod_1 = require("zod");
exports.createRecord = (0, callbacks_1.asyncHandler)(async (req, res, next) => {
    const record = InOut_1.InOutRecord.omit({ user: true }).parse(req.body);
    const amount = Number(record.amount);
    if (!amount)
        return next(new AppError_1.AppError("Invalid amount", 400));
    const tag = await tag_1.TagHandler.findOne({
        _id: record.tag,
        user: req.user._id,
    });
    if (!tag)
        return next(new AppError_1.AppError("Invalid tag", 400));
    const createdRecord = await inOutRecord_1.default.create({
        ...record,
        user: req.user._id,
    });
    res.json({ record: createdRecord });
});
exports.removeRecord = (0, callbacks_1.asyncHandler)(async (req, res, next) => {
    const recordId = zod_1.z.string().parse(req.params.recordId);
    const record = await inOutRecord_1.default.findOne({ _id: recordId });
    if (!record)
        return next(new AppError_1.AppError("Record doesnt exist", 404));
    if (record?.user?.toString() !== req?.user?._id?.toString())
        return next(new AppError_1.AppError("Record not owned", 401));
    const deleted = await inOutRecord_1.default.delete({
        _id: recordId,
        user: req.user._id,
    });
    res.json({ deleted });
});
exports.getDashboardInfo = (0, callbacks_1.asyncHandler)(async (req, res) => {
    const userId = req?.user?._id?.toString();
    const tag = zod_1.z.string().optional().parse(req.query.tag);
    const from = zod_1.z.string().optional().parse(req.query.from);
    const to = zod_1.z.string().optional().parse(req.query.to);
    const query = {
        user: userId,
    };
    if (tag)
        query["tag"] = tag;
    if (from && to) {
        query["createdAt"] = {
            $gte: new Date(from),
            $lte: new Date(to),
        };
    }
    const recordsByDate = await inOutRecord_1.default.find(query, {
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
    const records = await inOutRecord_1.default.find(query);
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
});
exports.getInOutRecords = (0, callbacks_1.asyncHandler)(async (req, res) => {
    const userId = req?.user?._id?.toString();
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 0;
    const recordType = InOut_1.InOutRecordType.optional().parse(req.query.recordType);
    const tag = zod_1.z.string().optional().parse(req.query.tag);
    const from = zod_1.z.string().optional().parse(req.query.from);
    const to = zod_1.z.string().optional().parse(req.query.to);
    let query = { user: userId };
    if (recordType)
        query = { ...query, type: recordType };
    if (tag)
        query = { ...query, tag };
    if (from && to)
        query = {
            ...query,
            createdAt: {
                $gte: new Date(from),
                $lte: new Date(to),
            },
        };
    const records = await inOutRecord_1.default.find(query, {
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
});
