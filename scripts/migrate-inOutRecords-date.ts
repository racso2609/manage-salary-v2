import mongoose from 'mongoose';
import InOutRecordSchema from '../src/models/inOutRecords';

async function migrate() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const InOutRecordModel = mongoose.model('InOutRecord', InOutRecordSchema);

  // Update all records that don't have a date field set date = createdAt
  const result = await InOutRecordModel.updateMany(
    { date: { $exists: false } }, // Only update records without date field
    [{ $set: { date: '$createdAt' } }] // Use aggregation pipeline to reference createdAt
  );

  console.log(`Migration completed: ${result.modifiedCount} records updated`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});