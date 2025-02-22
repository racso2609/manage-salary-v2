import { describe, beforeAll, afterAll } from "vitest";
import {
  MongoDBContainer,
  StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import mongoose, { Mongoose } from "mongoose";

export const DbTestDescribe = (
  name: string,
  fn: (mongoose: Mongoose) => void,
) => {
  describe(name, () => {
    let mongodbContainer: StartedMongoDBContainer | undefined;
    beforeAll(async () => {
      mongodbContainer = await new MongoDBContainer().start();
      const db = await mongoose.connect(
        `${mongodbContainer.getConnectionString()}?directConnection=true`,
      );

      console.log("Connected to MongoDB");

      const names = db.modelNames();
      names.forEach((name) => {
        db.deleteModel(name);
      });
    }, 100000);

    afterAll(async () => {
      mongoose.disconnect();
      if (mongodbContainer) mongodbContainer.stop();
    });

    fn(mongoose);
  });
};
