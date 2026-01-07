import { apiKeyAuth } from "./apiKeyAuth";
import passport from "passport";

export const combinedAuth = [passport.authenticate("bearer", { session: false }), apiKeyAuth];