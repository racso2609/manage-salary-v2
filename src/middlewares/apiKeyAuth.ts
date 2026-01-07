import { ApiKeyHandler } from "@/handlers/Db/apiKey";
import { UsersHandler } from "@/handlers/Db/users";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;
    if (!apiKey) return next();

    const hashed = crypto.createHash("sha256").update(apiKey).digest("hex");
    const apiKeyDoc = await ApiKeyHandler.findByHashedKey(hashed);

    if (!apiKeyDoc) return next();

    if (apiKeyDoc.expiresAt && new Date() > apiKeyDoc.expiresAt) return next();

    const user = await UsersHandler.findOne({ _id: apiKeyDoc.user });
    if (!user) return next();

    (req as any).user = user;
    next();
  } catch (error) {
    next();
  }
};