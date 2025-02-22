import mongoose from "mongoose";
import environment from "./env";
import { logger } from "./handlers/Loggers";

mongoose
  .connect(environment.MONGO_URI)
  .then(() => {
    logger.log("Mongo connected");
  })
  .catch(logger.error);
