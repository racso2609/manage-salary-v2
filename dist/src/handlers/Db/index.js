"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbRepository = void 0;
const mongoose_1 = require("mongoose");
require("@/models/index");
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
        if (overrideDbParams.offset)
            aggregateQuery.push({ $skip: overrideDbParams.offset });
        if (overrideDbParams.limit) {
            aggregateQuery.push({ $limit: overrideDbParams.limit });
        }
        if (overrideDbParams?.sort) {
            const parsedSort = Object.keys(overrideDbParams.sort).reduce((acc, key) => {
                if (overrideDbParams.sort)
                    acc[key] = overrideDbParams.sort[key] === "asc" ? 1 : -1;
                return acc;
            }, {});
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
    find(query, overrideDbParams = {}) {
        const aggregateQuery = this._manageQuery(query, overrideDbParams);
        return this.aggregate(aggregateQuery);
    }
    async findOne(query, _overrideDbParams = {}) {
        return this.model.findOne(query);
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
