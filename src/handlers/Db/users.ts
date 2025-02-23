import { User } from "@/types/Db/user";
import { DbRepository } from ".";
import UserSchema from "@/models/user";

class UserHandler extends DbRepository<User> {
  constructor() {
    super(UserSchema);
  }

  create(data: Omit<User, "roles" | "token">) {
    return super.create(User.parse(data));
  }
}

export const UsersHandler = new UserHandler();
