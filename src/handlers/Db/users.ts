import { DbRepository } from ".";
import UserModel from "@/models/user";

export const Users = new DbRepository(UserModel);
