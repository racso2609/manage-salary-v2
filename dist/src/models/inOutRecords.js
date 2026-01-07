"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InOut_1 = require("../types/InOut");
const mongoose_1 = require("mongoose");
const InOutRecordSchema = new mongoose_1.Schema({
    amount: { type: BigInt, required: true },
    description: String,
    currency: String,
    type: {
        type: String,
        enum: InOut_1.IN_OUT_RECORD_TYPES,
        require: true,
    },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "user" },
    tag: { type: mongoose_1.Schema.Types.ObjectId, ref: "tag" },
    date: { type: Date, required: true },
    externalId: String,
    secondaryAmount: BigInt,
    secondaryCurrency: String,
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("InOutRecord", InOutRecordSchema);
