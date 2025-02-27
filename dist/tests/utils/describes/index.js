"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbTestDescribe = void 0;
const vitest_1 = require("vitest");
const mongodb_1 = require("@testcontainers/mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
const DbTestDescribe = (name, fn) => {
    (0, vitest_1.describe)(name, () => {
        let mongodbContainer;
        (0, vitest_1.beforeAll)(async () => {
            mongodbContainer = await new mongodb_1.MongoDBContainer().start();
            const db = await mongoose_1.default.connect(`${mongodbContainer.getConnectionString()}?directConnection=true`);
            console.log("Connected to MongoDB");
            const names = db.modelNames();
            names.forEach((name) => {
                db.deleteModel(name);
            });
        }, 100000);
        (0, vitest_1.afterAll)(async () => {
            mongoose_1.default.disconnect();
            if (mongodbContainer)
                mongodbContainer.stop();
        });
        (0, vitest_1.describe)("Test suite", () => fn(mongoose_1.default));
    });
};
exports.DbTestDescribe = DbTestDescribe;
