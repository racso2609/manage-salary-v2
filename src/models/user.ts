import { ROLES, User } from "@/types/Db/user";
import { Document, model, Schema } from "mongoose";

export type UserModel = User & Document;

const userSchema = new Schema<UserModel>(
  {
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      unique: true,
    },
    roles: {
      type: [
        {
          type: String,
          enum: Object.values(ROLES),
        },
      ],
      required: true,
      default: [ROLES.USER],
    },
  },
  { timestamps: true },
);

export default model<UserModel>("User", userSchema);
