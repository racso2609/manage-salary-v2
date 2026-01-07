import { model, Schema, Types } from "mongoose";
import bcrypt from "mongoose-bcrypt";

interface ApiKey {
  user: Types.ObjectId;
  name: string;
  key: string;
  permissions: string[];
  expiresAt?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<ApiKey>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    key: { type: String, required: true },
    permissions: {
      type: [String],
      required: true,
      default: ["create_records"],
    },
    expiresAt: { type: Date },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

apiKeySchema.plugin(bcrypt);

export default model<ApiKey>("ApiKey", apiKeySchema);