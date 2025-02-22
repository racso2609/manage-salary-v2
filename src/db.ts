import mongoose from "mongoose";
import environment from "./env";

mongoose
  .connect(environment.MONGO_URI)
  .then(() => {
    console.log("Mongo connected");
  })
  .catch(console.error);
