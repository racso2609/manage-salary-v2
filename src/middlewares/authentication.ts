import { Users } from "@/handlers/Db/users";
import passport from "passport";
import { Strategy as BearerStrategy } from "passport-http-bearer";

passport.use(
  new BearerStrategy(async function (token, done) {
    try {
      const user = await Users.findOne({ token: token });
      if (!user) {
        return done(null, false);
      }
      return done(null, user, { scope: "all" });
    } catch (error) {
      return done(error);
    }
  }),
);

export const protect = passport.authenticate("bearer", { session: false });
