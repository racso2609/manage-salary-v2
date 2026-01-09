import { asyncHandler } from "@/handlers/callbacks";
import InOutRecordHandler from "@/handlers/Db/inOutRecord";
import { TagHandler } from "@/handlers/Db/tag";
import { AppError } from "@/handlers/Errors/AppError";
import { AuthenticatedRequest } from "@/types/Db/user";
import { InOutRecord, InOutRecordType, AnalyticsQuery } from "@/types/InOut";
import { NextFunction, Response } from "express";
import { FilterQuery, PipelineStage, Types } from "mongoose";
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

export const createRecords = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const rawRecords = z
      .array(InOutRecord.omit({ user: true }))
      .parse(req.body.records);

    const records: InOutRecord[] = [];

    for (const record of rawRecords) {
      const amount = Number(record.amount);
      if (!amount) return next(new AppError("Invalid amount in records", 400));

      if (record.tag) {
        const tag = await TagHandler.findOne({
          _id: record.tag,
          user: req.user._id,
        });
        if (!tag) return next(new AppError("Invalid tag in records", 400));
      }

      const externalIdExist = await InOutRecordHandler.findOne({
        externalId: record.externalId,
        user: req.user._id,
      });

      if (!externalIdExist) records.push(record);
      else {
        console.log(
          `Record with externalId ${record.externalId} already exists, skipping.`,
        );
      }
    }

    const recordsWithUser = records.map((record) => ({
      ...record,
      user: req.user._id,
    }));

    const createdRecords = await InOutRecordHandler.createMany(recordsWithUser);

    res.json({ records: createdRecords });
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
      query["date"] = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const recordsByDate = await InOutRecordHandler.find(query, {
      group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
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
      sort: { date: -1 },
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

export const updateRecord = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const recordId = z.string().parse(req.params.recordId);
    const updateData = InOutRecord.omit({ user: true })
      .partial()
      .parse(req.body);

    const existingRecord = await InOutRecordHandler.findOne({ _id: recordId });
    if (!existingRecord) return next(new AppError("Record doesnt exist", 404));

    if (existingRecord?.user?.toString() !== req?.user?._id?.toString())
      return next(new AppError("Record not owned", 401));

    if (updateData.amount) {
      const amount = Number(updateData.amount);
      if (!amount) return next(new AppError("Invalid amount", 400));
    }

    if (updateData.tag) {
      const tag = await TagHandler.findOne({
        _id: updateData.tag,
        user: req.user._id,
      });
      if (!tag) return next(new AppError("Invalid tag", 400));
    }

    const updatedRecord = await InOutRecordHandler.update(
      { _id: recordId, user: req.user._id },
      updateData,
    );

    res.json({ record: updatedRecord });
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
        date: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
      };

    const records = await InOutRecordHandler.find(query, {
      limit,
      offset: page * limit,
      sort: { date: -1 },
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

export const getAnalytics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.user?._id?.toString();
    const queryParams = AnalyticsQuery.parse(req.query);

    const { tag, from, to } = queryParams;

    // Default to all time if no dates
    const now = new Date();
    const defaultFrom = new Date(0);
    const defaultTo = now;

    const startDate = from ? new Date(from) : defaultFrom;
    const endDate = to ? new Date(to) : defaultTo;

    const daysDiff = Math.max(
      1,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    const baseQuery = {
      user: new Types.ObjectId(userId),
      type: "out",
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (tag) baseQuery["tag"] = tag;

    // Aggregation pipeline
    const pipeline: PipelineStage[] = [
      { $match: baseQuery },
      {
        $facet: {
          // Total spending
          totalSpending: [
            {
              $group: {
                _id: null,
                total: { $sum: { $toDouble: "$amount" } },
              },
            },
          ],
          // Daily average (overall)
          dailyAvg: [
            {
              $group: {
                _id: null,
                total: { $sum: { $toDouble: "$amount" } },
              },
            },
          ],
          // Spending trend: split into older/recent
          spendingTrend: [
            {
              $group: {
                _id: {
                  month: { $dateToString: { format: "%Y-%m", date: "$date" } },
                },
                total: { $sum: { $toDouble: "$amount" } },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.month": 1 } },
          ],
          // Peak spending day
          peakDay: [
            {
              $group: {
                _id: {
                  date: {
                    $dateToString: { format: "%Y-%m-%d", date: "$date" },
                  },
                },
                total: { $sum: { $toDouble: "$amount" } },
              },
            },
            { $sort: { total: -1 } },
            { $limit: 1 },
          ],
          // Top category
          topCategory: [
            {
              $lookup: {
                from: "tags",
                localField: "tag",
                foreignField: "_id",
                as: "tagInfo",
              },
            },
            { $unwind: "$tagInfo" },
            {
              $group: {
                _id: { name: "$tagInfo.name" },
                total: { $sum: { $toDouble: "$amount" } },
              },
            },
            { $sort: { total: -1 } },
            { $limit: 1 },
          ],
          // Busiest day of week
          busiestDay: [
            {
              $group: {
                _id: {
                  dayOfWeek: { $dayOfWeek: "$date" }, // 1=Sunday, 7=Saturday
                },
                total: { $sum: { $toDouble: "$amount" } },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 1,
                avg: { $divide: ["$total", "$count"] },
              },
            },
            { $sort: { avg: -1 } },
            { $limit: 1 },
          ],
        },
      },
    ];

    const result = await InOutRecordHandler.aggregate(pipeline);
    console.log("=== analytics result", JSON.stringify(result, null, 2));

    if (!result || result.length === 0) {
      return res.json({
        totalSpending: 0,
        dailyAverage: 0,
        spendingTrend: {
          recentAvg: 0,
          olderAvg: 0,
          changePercent: 0,
          trendDirection: "neutral",
        },
        peakSpendingDay: null,
        topCategory: null,
        busiestDay: null,
      });
    }

    const data = result[0];

    // Process total spending
    const totalSpendingRaw = data.totalSpending[0]?.total || 0n;
    const totalSpending = Number(totalSpendingRaw);

    // Daily average
    const dailyAverage = totalSpending / daysDiff;

    // Spending trend
    const months = data.spendingTrend;
    const midIndex = Math.floor(months.length / 2);
    const olderMonths = months.slice(0, midIndex);
    const recentMonths = months.slice(midIndex);

    const olderTotal = olderMonths.reduce((sum, m) => sum + Number(m.total), 0);
    const recentTotal = recentMonths.reduce(
      (sum, m) => sum + Number(m.total),
      0,
    );
    const olderCount = olderMonths.reduce((sum, m) => sum + m.count, 0);
    const recentCount = recentMonths.reduce((sum, m) => sum + m.count, 0);

    const olderAvg = olderCount > 0 ? olderTotal / olderCount : 0;
    const recentAvg = recentCount > 0 ? recentTotal / recentCount : 0;
    const changePercent =
      olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    const trendDirection =
      changePercent > 5 ? "up" : changePercent < -5 ? "down" : "neutral";

    // Peak day
    const peakSpendingDay =
      data.peakDay.length > 0
        ? {
            date: data.peakDay[0]._id.date,
            amount: Number(data.peakDay[0].total),
          }
        : null;

    // Top category
    const topCategory =
      data.topCategory.length > 0
        ? {
            name: data.topCategory[0]._id.name,
            amount: Number(data.topCategory[0].total),
          }
        : null;

    // Busiest day (adjust dayOfWeek: 1=Sun to 0=Sun, 7=Sat to 6=Sat)
    const busiestDayRaw =
      data.busiestDay.length > 0 ? data.busiestDay[0] : null;
    const busiestDay = busiestDayRaw
      ? {
          dayOfWeek: (busiestDayRaw._id.dayOfWeek - 1) % 7,
          avg: Number(busiestDayRaw.avg),
        }
      : null;

    res.json({
      totalSpending,
      dailyAverage,
      spendingTrend: {
        recentAvg,
        olderAvg,
        changePercent,
        trendDirection,
      },
      peakSpendingDay,
      topCategory,
      busiestDay,
    });
  },
);
