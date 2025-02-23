import { ROLES, User } from "@/types/Db/user";
import { model, Schema } from "mongoose";
import bcrypt from "mongoose-bcrypt";

const userSchema = new Schema<User>(
  {
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
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

userSchema.plugin(bcrypt);

export default model<User>("User", userSchema);
