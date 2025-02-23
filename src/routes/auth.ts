import { login, refreshToken, signup, tokenStatus } from "@/controllers/auth";
import { protect } from "@/middlewares/authentication";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/signup", signup);
authRouter.get("/refresh", protect, refreshToken);
authRouter.get("/status", protect, tokenStatus);

export default authRouter;
