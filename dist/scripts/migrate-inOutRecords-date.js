"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = __importDefault(require("../src/env"));
const inOutRecords_1 = __importDefault(require("../src/models/inOutRecords"));
async function migrate() {
    const mongoUri = env_1.default.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGODB_URI environment variable is required");
    }
    await mongoose_1.default.connect(mongoUri);
    console.log("Connected to MongoDB");
    // Update all records that don't have a date field set date = createdAt
    const result = await inOutRecords_1.default.updateMany({ date: { $exists: false } }, // Only update records without date field
    [{ $set: { date: "$createdAt" } }]);
    console.log(`Migration completed: ${result.modifiedCount} records updated`);
    await mongoose_1.default.disconnect();
    console.log("Disconnected from MongoDB");
}
migrate().catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
});
