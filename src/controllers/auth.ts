import AuthHandler from "@/handlers/Auth";
import { asyncHandler } from "@/handlers/callbacks";
import { UsersHandler } from "@/handlers/Db/users";
import { ApiKeyHandler } from "@/handlers/Db/apiKey";
import { AppError } from "@/handlers/Errors/AppError";
import { AuthenticatedRequest, User } from "@/types/Db/user";
import { CreateApiKey } from "@/types/ApiKey";
import { NextFunction, Request, Response } from "express";

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = User.omit({
      token: true,
      roles: true,
      userName: true,
    }).parse(req.body);

    const user = await UsersHandler.findOne({ email });
    if (!user) return next(new AppError("Invalid email or password", 400));

    const isValidPassword = await user?.verifyPassword?.(password);
    if (!isValidPassword)
      return next(new AppError("Invalid email or password", 400));

    const token = AuthHandler.getToken(user);

    await UsersHandler.updateOne({ _id: user._id }, { token });

    res.json({ token });
  },
);

export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, userName } = User.omit({
      roles: true,
      token: true,
    }).parse(req.body);

    const existUser = await UsersHandler.findOne({
      $or: [{ email }, { userName }],
    });

    if (existUser) return next(new AppError("User already exist!", 400));

    const user = await UsersHandler.create({ email, password, userName });

    res.json({ user });
  },
);

export const refreshToken = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    const newToken = AuthHandler.getToken(user);
    await UsersHandler.updateOne({ token: user.token }, { token: newToken });

    res.json({ token: newToken });
  },
);

export const tokenStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { token } = req.user;
    const tokenStatus = AuthHandler.getTokenStatus(token);

    res.json({
      ...tokenStatus,
    });
  },
);

export const generateApiKey = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { name, permissions, expiresAt } = CreateApiKey.parse(req.body);

    const { plain, hash } = ApiKeyHandler.generateKey();

    const expires = expiresAt ? new Date(expiresAt) : undefined;

    const apiKeyDoc = await ApiKeyHandler.createApiKey({
      user: (req.user._id as string).toString(),
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
  },
);

export const listApiKeys = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const apiKeys = await ApiKeyHandler.findByUser((req.user._id as string).toString());

    res.json({ apiKeys });
  },
);

export const deleteApiKey = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const keyId = req.params.keyId;

    const apiKey = await ApiKeyHandler.findOne({ _id: keyId });
    if (!apiKey || apiKey.user.toString() !== (req.user._id as string).toString()) {
      return next(new AppError("API Key not found", 404));
    }

    await ApiKeyHandler.updateOne({ _id: keyId }, { active: false });

    res.json({ message: "API Key deactivated" });
  },
);

export const updateApiKey = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const keyId = req.params.keyId;
    const { permissions, expiresAt } = req.body;

    const apiKey = await ApiKeyHandler.findOne({ _id: keyId });
    if (!apiKey || apiKey.user.toString() !== (req.user._id as string).toString()) {
      return next(new AppError("API Key not found", 404));
    }

    const updateData: any = {};
    if (permissions) updateData.permissions = permissions;
    if (expiresAt) updateData.expiresAt = new Date(expiresAt);

    const updated = await ApiKeyHandler.updateOne({ _id: keyId }, updateData);

    res.json({ updated });
  },
);
