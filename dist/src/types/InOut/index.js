"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardDataResponse = exports.MonthlyData = exports.DashboardTotals = exports.InsightsResponse = exports.Recommendation = exports.SpendingPattern = exports.SpendingTrend = exports.PeakSpending = exports.AnalyticsQuery = exports.InOutRecordType = exports.InOutRecord = exports.IN_OUT_RECORD_TYPES = void 0;
const zod_1 = require("zod");
exports.IN_OUT_RECORD_TYPES = ["in", "out"];
exports.InOutRecord = zod_1.z.object({
    // amount incoming if currency is usd 2 zeros for decimals
    amount: zod_1.z.preprocess((a) => BigInt(Number(a?.toString()).toFixed(0) || 0), zod_1.z.bigint()),
    type: zod_1.z.enum(exports.IN_OUT_RECORD_TYPES),
    currency: zod_1.z.preprocess((a) => a?.toString().toUpperCase(), zod_1.z.string()),
    user: zod_1.z.unknown(),
    description: zod_1.z.string(),
    tag: zod_1.z.unknown(),
    date: zod_1.z.preprocess((a) => {
        return ["string", "number", "Date"].includes(typeof a)
            ? new Date(a)
            : a;
    }, zod_1.z.date()),
    externalId: zod_1.z.string().optional(),
    secondaryAmount: zod_1.z
        .preprocess((a) => BigInt(a?.toString() || 0), zod_1.z.bigint())
        .optional(),
    secondaryCurrency: zod_1.z
        .preprocess((a) => a?.toString().toUpperCase(), zod_1.z.string())
        .optional(),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
});
exports.InOutRecordType = zod_1.z.enum(exports.IN_OUT_RECORD_TYPES);
exports.AnalyticsQuery = zod_1.z.object({
    tag: zod_1.z.string().optional(),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
});
// Phase 2: Advanced Insights API types
exports.PeakSpending = zod_1.z.object({
    period: zod_1.z.string(), // e.g., "monthly", "weekly"
    date: zod_1.z.date(),
    amount: zod_1.z.bigint(),
});
exports.SpendingTrend = zod_1.z.object({
    period: zod_1.z.string(), // e.g., "mom" (month-over-month), "yoy" (year-over-year)
    change: zod_1.z.number(), // percentage change
    direction: zod_1.z.enum(["up", "down", "neutral"]),
});
exports.SpendingPattern = zod_1.z.object({
    type: zod_1.z.string(), // e.g., "cycle", "anomaly"
    description: zod_1.z.string(), // e.g., "Higher spending on weekends"
    data: zod_1.z.array(zod_1.z.any()), // flexible for anomalies, cycles
});
exports.Recommendation = zod_1.z.object({
    type: zod_1.z.string(), // e.g., "budget", "saving"
    message: zod_1.z.string(), // e.g., "Reduce spending on entertainment by 15%"
});
exports.InsightsResponse = zod_1.z.object({
    peaks: zod_1.z.array(exports.PeakSpending),
    trends: zod_1.z.array(exports.SpendingTrend),
    patterns: zod_1.z.array(exports.SpendingPattern),
    recommendations: zod_1.z.array(exports.Recommendation),
});
// Phase 3: Dashboard Data API types
exports.DashboardTotals = zod_1.z.object({
    income: zod_1.z.bigint(),
    expenses: zod_1.z.bigint(),
    savingsRate: zod_1.z.number(), // percentage
    balance: zod_1.z.bigint(),
});
exports.MonthlyData = zod_1.z.object({
    month: zod_1.z.string(), // YYYY-MM
    income: zod_1.z.bigint(),
    expenses: zod_1.z.bigint(),
    balance: zod_1.z.bigint(),
});
exports.DashboardDataResponse = zod_1.z.object({
    totals: exports.DashboardTotals,
    monthly: zod_1.z.array(exports.MonthlyData),
    analytics: zod_1.z.any(), // reuse from existing analytics
});
