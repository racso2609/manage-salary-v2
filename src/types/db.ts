import {
  FilterQuery,
  Document,
  UpdateQuery,
  UpdateWriteOpResult,
  SortOrder,
} from "mongoose";

export type OverrideDbParams = Partial<{
  sort: Record<string, SortOrder>;
  group: Record<string, unknown> & { _id: string };
  populates: { path: string; unique?: boolean }[];
  limit: number;
  offset: number;
}>;

export type DbRepository<T> = {
  find(
    query: FilterQuery<T>,
    overrideParams?: OverrideDbParams,
  ): Promise<Document<unknown, unknown, T>[]>;
  findOne(
    query: FilterQuery<T>,
    overrideParams?: OverrideDbParams,
  ): Promise<Document<unknown, unknown, T> | null>;
  create(data: T): Promise<T>;
  updateOne(
    query: FilterQuery<T>,
    data: UpdateQuery<T>,
  ): Promise<Document<unknown, unknown, T> | null>;
  update(
    query: FilterQuery<T>,
    data: UpdateQuery<T>,
  ): Promise<UpdateWriteOpResult>;
  delete(query: FilterQuery<T>): Promise<boolean>;
  updateOrCreate(
    query: FilterQuery<T>,
    data: UpdateQuery<T>,
  ): Promise<Document<unknown, unknown, T> | null>;
};
