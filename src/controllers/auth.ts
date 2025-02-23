import AuthHandler from "@/handlers/Auth";
import { asyncHandler } from "@/handlers/callbacks";
import { UsersHandler } from "@/handlers/Db/users";
import { AppError } from "@/handlers/Errors/AppError";
import { AuthenticatedRequest, User } from "@/types/Db/user";
import { NextFunction, Request, Response } from "express";
import { token } from "morgan";

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
