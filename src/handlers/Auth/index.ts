import environment from "@/env";
import { User } from "@/types/Db/user";
import jwt, { JwtPayload } from "jsonwebtoken";

class AuthHandler implements AuthHandler {
  constructor(protected secret: string = environment.JWT_SECRET) {}

  getToken(user: User) {
    const userData = User.omit({ password: true }).parse(user);

    return jwt.sign({ userName: userData.userName }, this.secret, {
      expiresIn: "7d",
    });
  }

  validateToken(token: string) {
    const data = jwt.verify(token, this.secret);
    return !!data;
  }

  decodeToken(token: string) {
    return jwt.verify(token, this.secret);
  }

  getTokenStatus(token: string) {
    const tokenData = jwt.verify(token, this.secret) as JwtPayload;
    if (!tokenData.exp) throw new Error("Invalid token");

    const expireIn = tokenData.exp * 1000 - Date.now();
    const expired = !expireIn;

    return {
      expired,
      expireIn,
    };
  }
}

export default new AuthHandler();
