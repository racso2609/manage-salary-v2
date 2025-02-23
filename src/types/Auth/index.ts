import { Token, User } from "../Db/user";

export interface AuthHandlerRepository {
  getToken(user: User): Token;
  validateToken(token: string): boolean;
  decodeToken(token: string): User;
  getTokenStatus(token: string): {
    expireIn: number;
    expired: boolean;
  };
}
