"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const InOut_1 = require("../../types/InOut");
const inOutRecords_1 = __importDefault(require("../../models/inOutRecords"));
const _1 = require(".");
class InOutRecordHandlerRepository extends _1.DbRepository {
    constructor() {
        super(inOutRecords_1.default);
    }
    create(data) {
        return this.model.create(InOut_1.InOutRecord.parse(data));
    }
    createMany(data) {
        const parsedData = data.map(d => InOut_1.InOutRecord.parse(d));
        return this.model.insertMany(parsedData);
    }
}
const InOutRecordHandler = new InOutRecordHandlerRepository();
exports.default = InOutRecordHandler;
