"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApiKey = exports.deleteApiKey = exports.listApiKeys = exports.generateApiKey = exports.tokenStatus = exports.refreshToken = exports.signup = exports.login = void 0;
const Auth_1 = __importDefault(require("../handlers/Auth"));
const callbacks_1 = require("../handlers/callbacks");
const users_1 = require("../handlers/Db/users");
const apiKey_1 = require("../handlers/Db/apiKey");
const AppError_1 = require("../handlers/Errors/AppError");
const user_1 = require("../types/Db/user");
const ApiKey_1 = require("../types/ApiKey");
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
exports.generateApiKey = (0, callbacks_1.asyncHandler)(async (req, res, next) => {
    const { name, permissions, expiresAt } = ApiKey_1.CreateApiKey.parse(req.body);
    const { plain, hash } = apiKey_1.ApiKeyHandler.generateKey();
    const expires = expiresAt ? new Date(expiresAt) : undefined;
    const apiKeyDoc = await apiKey_1.ApiKeyHandler.createApiKey({
        user: req.user._id.toString(),
        name,
        key: hash,
        permissions,
        expiresAt: expires,
    });
    res.json({
        apiKey: plain,
        name: apiKeyDoc.name,
        permissions: apiKeyDoc.permissions,
        expiresAt: apiKeyDoc.expiresAt,
        createdAt: apiKeyDoc.createdAt,
    });
});
exports.listApiKeys = (0, callbacks_1.asyncHandler)(async (req, res) => {
    const apiKeys = await apiKey_1.ApiKeyHandler.findByUser(req.user._id.toString());
    res.json({ apiKeys });
});
exports.deleteApiKey = (0, callbacks_1.asyncHandler)(async (req, res, next) => {
    const keyId = req.params.keyId;
    const apiKey = await apiKey_1.ApiKeyHandler.findOne({ _id: keyId });
    if (!apiKey || apiKey.user.toString() !== req.user._id.toString()) {
        return next(new AppError_1.AppError("API Key not found", 404));
    }
    await apiKey_1.ApiKeyHandler.updateOne({ _id: keyId }, { active: false });
    res.json({ message: "API Key deactivated" });
});
exports.updateApiKey = (0, callbacks_1.asyncHandler)(async (req, res, next) => {
    const keyId = req.params.keyId;
    const { permissions, expiresAt } = req.body;
    const apiKey = await apiKey_1.ApiKeyHandler.findOne({ _id: keyId });
    if (!apiKey || apiKey.user.toString() !== req.user._id.toString()) {
        return next(new AppError_1.AppError("API Key not found", 404));
    }
    const updateData = {};
    if (permissions)
        updateData.permissions = permissions;
    if (expiresAt)
        updateData.expiresAt = new Date(expiresAt);
    const updated = await apiKey_1.ApiKeyHandler.updateOne({ _id: keyId }, updateData);
    res.json({ updated });
});
