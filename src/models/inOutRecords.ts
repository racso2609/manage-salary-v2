import { IN_OUT_RECORD_TYPES, InOutRecord } from "@/types/InOut";
import { model, Schema } from "mongoose";

const InOutRecordSchema = new Schema<InOutRecord>(
  {
    amount: { type: BigInt, required: true },
    description: String,
    currency: String,
    type: {
      type: String,
      enum: IN_OUT_RECORD_TYPES,
      require: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "user" },
    tag: { type: Schema.Types.ObjectId, ref: "tag" },
    date: { type: Date, required: true },
  },
  { timestamps: true },
);

export default model<InOutRecord>("InOutRecord", InOutRecordSchema);
