"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenStatus = exports.refreshToken = exports.signup = exports.login = void 0;
const Auth_1 = __importDefault(require("../handlers/Auth"));
const callbacks_1 = require("../handlers/callbacks");
const users_1 = require("../handlers/Db/users");
const AppError_1 = require("../handlers/Errors/AppError");
const user_1 = require("../types/Db/user");
exports.login = (0, callbacks_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = user_1.User.omit({
        token: true,
        roles: true,
        userName: true,
    }).parse(req.body);
    const user = await users_1.UsersHandler.findOne({ email });
    if (!user)
        return next(new AppError_1.AppError("Invalid email or password", 400));
    const isValidPassword = await user?.verifyPassword?.(password);
    if (!isValidPassword)
        return next(new AppError_1.AppError("Invalid email or password", 400));
    const token = Auth_1.default.getToken(user);
    await users_1.UsersHandler.updateOne({ _id: user._id }, { token });
    res.json({ token });
});
exports.signup = (0, callbacks_1.asyncHandler)(async (req, res, next) => {
    const { email, password, userName } = user_1.User.omit({
        roles: true,
        token: true,
    }).parse(req.body);
    const existUser = await users_1.UsersHandler.findOne({
        $or: [{ email }, { userName }],
    });
    if (existUser)
        return next(new AppError_1.AppError("User already exist!", 400));
    const user = await users_1.UsersHandler.create({ email, password, userName });
    res.json({ user });
});
exports.refreshToken = (0, callbacks_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const newToken = Auth_1.default.getToken(user);
    await users_1.UsersHandler.updateOne({ token: user.token }, { token: newToken });
    res.json({ token: newToken });
});
exports.tokenStatus = (0, callbacks_1.asyncHandler)(async (req, res) => {
    const { token } = req.user;
    const tokenStatus = Auth_1.default.getTokenStatus(token);
    res.json({
        ...tokenStatus,
    });
});
