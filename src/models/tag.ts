import { Tag } from "@/types/Tags";
import { model, Schema } from "mongoose";

const tagSchema = new Schema<Tag>(
  {
    name: String,
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true },
);
export default model<Tag>("Tag", tagSchema);
