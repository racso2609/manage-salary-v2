import {
  Model,
  FilterQuery,
  UpdateWriteOpResult,
  UpdateQuery,
  PipelineStage,
  isValidObjectId,
  Types,
  Document,
} from "mongoose";
import "@/models/index";
import { OverrideDbParams, DbRepository as Repository } from "@/types/db";

export class DbRepository<T> implements Repository<T> {
  constructor(protected model: Model<T>) {}

  protected _manageQuery(
    query: FilterQuery<T>,
    overrideDbParams: OverrideDbParams = {},
  ) {
    const parsedQuery = Object.keys(query).reduce(
      (acc, key) => {
        const value = query[key];
        const isId = isValidObjectId(value);
        acc[key] = isId ? new Types.ObjectId(value) : value;
        return acc;
      },
      {} as Record<string, unknown>,
    );
    const aggregateQuery: PipelineStage[] = [{ $match: parsedQuery }];

    if (overrideDbParams.limit) {
      aggregateQuery.push({ $limit: overrideDbParams.limit });
    }

    if (overrideDbParams.offset)
      aggregateQuery.push({ $skip: overrideDbParams.offset });

    if (overrideDbParams?.sort) {
      const parsedSort = Object.keys(overrideDbParams.sort).reduce(
        (acc, key) => {
          if (overrideDbParams.sort)
            acc[key] = overrideDbParams.sort[key] === "asc" ? 1 : -1;
          return acc;
        },
        {} as Record<string, 1 | -1>,
      );

      aggregateQuery.push({ $sort: parsedSort });
    }
    if (overrideDbParams?.populates?.length) {
      overrideDbParams.populates.forEach(({ path: populate, unique }) => {
        aggregateQuery.push({
          $lookup: {
            from: populate + "s",
            localField: populate,
            foreignField: "_id",
            as: populate,
          },
        });
        if (unique)
          aggregateQuery.push({
            $unwind: {
              path: `$${populate}`,
              preserveNullAndEmptyArrays: true,
            },
          });
      });
    }

    if (overrideDbParams?.group)
      aggregateQuery.push({ $group: overrideDbParams.group });

    // isValidObjectId()

    return aggregateQuery;
  }

  find(query: FilterQuery<T>, overrideDbParams: OverrideDbParams = {}) {
    const aggregateQuery = this._manageQuery(query, overrideDbParams);
    return this.aggregate(aggregateQuery);
  }

  async findOne(
    query: FilterQuery<T>,
    _overrideDbParams: OverrideDbParams = {},
  ) {
    return this.model.findOne(query);
  }

  async create(data: T) {
    return await this.model.create(data);
  }

  async updateOne(query: FilterQuery<T>, data: UpdateQuery<T>) {
    return await this.model.findOneAndUpdate(query, data, { new: true });
  }

  async update(
    query: FilterQuery<T>,
    data: UpdateQuery<T>,
  ): Promise<UpdateWriteOpResult> {
    return await this.model.updateMany(query, data, { new: true });
  }

  async delete(query: FilterQuery<T>): Promise<boolean> {
    const deleteResult = await this.model.deleteOne(query);
    return deleteResult.deletedCount > 0;
  }
  async deleteMany(query: FilterQuery<T>): Promise<boolean> {
    const deleteResult = await this.model.deleteMany(query);
    return deleteResult.deletedCount > 0;
  }

  async updateOrCreate(query: FilterQuery<T>, data: UpdateQuery<T>) {
    return await this.model.findOneAndUpdate(query, data, {
      upsert: true,
      new: true,
    });
  }

  aggregate(pipeline: PipelineStage[]) {
    return this.model.aggregate(pipeline);
  }
}
