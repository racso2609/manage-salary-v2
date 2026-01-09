import { z } from "zod";

export const IN_OUT_RECORD_TYPES = ["in", "out"] as const;

export const InOutRecord = z.object({
  // amount incoming if currency is usd 2 zeros for decimals
  amount: z.preprocess(
    (a) => BigInt(Number(a?.toString()).toFixed(0) || 0),
    z.bigint(),
  ),
  type: z.enum(IN_OUT_RECORD_TYPES),
  currency: z.preprocess((a) => a?.toString().toUpperCase(), z.string()),
  user: z.unknown(),
  description: z.string(),
  tag: z.unknown(),
  date: z.preprocess((a) => {
    return ["string", "number", "Date"].includes(typeof a)
      ? new Date(a as string | number)
      : a;
  }, z.date()),
  externalId: z.string().optional(),
  secondaryAmount: z
    .preprocess((a) => BigInt(a?.toString() || 0), z.bigint())
    .optional(),
  secondaryCurrency: z
    .preprocess((a) => a?.toString().toUpperCase(), z.string())
    .optional(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type InOutRecord = z.infer<typeof InOutRecord>;

export const InOutRecordType = z.enum(IN_OUT_RECORD_TYPES);
export type InOutRecordType = z.infer<typeof InOutRecordType>;

export const AnalyticsQuery = z.object({
  tag: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type AnalyticsQuery = z.infer<typeof AnalyticsQuery>;

// Phase 2: Advanced Insights API types
export const PeakSpending = z.object({
  period: z.string(), // e.g., "monthly", "weekly"
  date: z.date(),
  amount: z.bigint(),
});

export const SpendingTrend = z.object({
  period: z.string(), // e.g., "mom" (month-over-month), "yoy" (year-over-year)
  change: z.number(), // percentage change
  direction: z.enum(["up", "down", "neutral"]),
});

export const SpendingPattern = z.object({
  type: z.string(), // e.g., "cycle", "anomaly"
  description: z.string(), // e.g., "Higher spending on weekends"
  data: z.array(z.any()), // flexible for anomalies, cycles
});

export const Recommendation = z.object({
  type: z.string(), // e.g., "budget", "saving"
  message: z.string(), // e.g., "Reduce spending on entertainment by 15%"
});

export const InsightsResponse = z.object({
  peaks: z.array(PeakSpending),
  trends: z.array(SpendingTrend),
  patterns: z.array(SpendingPattern),
  recommendations: z.array(Recommendation),
});

export type InsightsResponse = z.infer<typeof InsightsResponse>;

// Phase 3: Dashboard Data API types
export const DashboardTotals = z.object({
  income: z.bigint(),
  expenses: z.bigint(),
  savingsRate: z.number(), // percentage
  balance: z.bigint(),
});

export const MonthlyData = z.object({
  month: z.string(), // YYYY-MM
  income: z.bigint(),
  expenses: z.bigint(),
  balance: z.bigint(),
});

export const DashboardDataResponse = z.object({
  totals: DashboardTotals,
  monthly: z.array(MonthlyData),
  analytics: z.any(), // reuse from existing analytics
});

export type DashboardDataResponse = z.infer<typeof DashboardDataResponse>;
