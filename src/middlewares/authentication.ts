import { UsersHandler } from "@/handlers/Db/users";
import passport from "passport";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import AuthHandler from "@/handlers/Auth";

passport.use(
  new BearerStrategy(async function (token, done) {
    try {
      const isValidToken = AuthHandler.validateToken(token);
      if (!isValidToken) return done(null, false);

      const user = await UsersHandler.findOne({ token: token });
      if (!user) return done(null, false);

      return done(null, user, { scope: "all" });
    } catch (error) {
      return done(error);
    }
  }),
);

export const protect = passport.authenticate("bearer", { session: false });
