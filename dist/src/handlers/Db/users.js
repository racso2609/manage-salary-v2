"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersHandler = void 0;
const user_1 = require("@/types/Db/user");
const _1 = require(".");
const user_2 = __importDefault(require("@/models/user"));
class UserHandler extends _1.DbRepository {
    constructor() {
        super(user_2.default);
    }
    create(data) {
        return super.create(user_1.User.parse(data));
    }
}
exports.UsersHandler = new UserHandler();
