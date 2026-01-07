import { login, refreshToken, signup, tokenStatus, generateApiKey, listApiKeys, deleteApiKey, updateApiKey } from "@/controllers/auth";
import { protect } from "@/middlewares/authentication";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/signup", signup);
authRouter.get("/refresh", protect, refreshToken);
authRouter.get("/status", protect, tokenStatus);
authRouter.post("/api-keys", protect, generateApiKey);
authRouter.get("/api-keys", protect, listApiKeys);
authRouter.delete("/api-keys/:keyId", protect, deleteApiKey);
authRouter.patch("/api-keys/:keyId", protect, updateApiKey);

export default authRouter;
