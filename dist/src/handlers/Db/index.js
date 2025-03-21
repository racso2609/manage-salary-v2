"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbRepository = void 0;
const mongoose_1 = require("mongoose");
require("../../models/index");
class DbRepository {
    constructor(model) {
        this.model = model;
    }
    _manageQuery(query, overrideDbParams = {}) {
        const parsedQuery = Object.keys(query).reduce((acc, key) => {
            const value = query[key];
            const isId = (0, mongoose_1.isValidObjectId)(value);
            acc[key] = isId ? new mongoose_1.Types.ObjectId(value) : value;
            return acc;
        }, {});
        const aggregateQuery = [{ $match: parsedQuery }];
        if (overrideDbParams?.sort) {
            const parsedSort = Object.keys(overrideDbParams.sort).reduce((acc, key) => {
                if (overrideDbParams.sort)
                    acc[key] = overrideDbParams.sort[key] === "asc" ? 1 : -1;
                return acc;
            }, {});
            aggregateQuery.push({ $sort: parsedSort });
        }
        if (overrideDbParams.offset)
            aggregateQuery.push({ $skip: overrideDbParams.offset });
        if (overrideDbParams.limit) {
            aggregateQuery.push({ $limit: overrideDbParams.limit });
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
        return aggregateQuery;
    }
    find(query, overrideDbParams = {}) {
        const aggregateQuery = this._manageQuery(query, overrideDbParams);
        return this.aggregate(aggregateQuery);
    }
    async findOne(query, overrideDbParams = {}) {
        let aggregate = this.model.findOne(query);
        if (overrideDbParams.sort)
            aggregate = aggregate.sort(overrideDbParams.sort);
        if (overrideDbParams.offset)
            aggregate = aggregate.skip(overrideDbParams.offset);
        if (overrideDbParams.limit)
            aggregate = aggregate.limit(overrideDbParams.limit);
        // TODO: add populate
        // if (overrideDbParams.populates?.length)
        // aggregate = aggregate.populate(overrideDbParams.populates);
        // const a = this.model.findOne(query);
        return await aggregate.exec();
    }
    async create(data) {
        return await this.model.create(data);
    }
    async updateOne(query, data) {
        return await this.model.findOneAndUpdate(query, data, { new: true });
    }
    async update(query, data) {
        return await this.model.updateMany(query, data, { new: true });
    }
    async delete(query) {
        const deleteResult = await this.model.deleteOne(query);
        return deleteResult.deletedCount > 0;
    }
    async deleteMany(query) {
        const deleteResult = await this.model.deleteMany(query);
        return deleteResult.deletedCount > 0;
    }
    async updateOrCreate(query, data) {
        return await this.model.findOneAndUpdate(query, data, {
            upsert: true,
            new: true,
        });
    }
    aggregate(pipeline) {
        return this.model.aggregate(pipeline);
    }
}
exports.DbRepository = DbRepository;
