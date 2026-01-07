 import { apiKeyAuth } from "./apiKeyAuth";
 import passport from "passport";
 import { Request, Response, NextFunction } from "express";

 export const combinedAuth = (req: Request, res: Response, next: NextFunction) => {
   const authHeader = req.headers.authorization;
   const apiKeyHeader = req.headers['x-api-key'] as string;

   if (authHeader) {
     // Use bearer validation
     passport.authenticate("bearer", { session: false }, (err, user, info) => {
       if (err) {
         return next(err);
       }
       if (user) {
         req.user = user;
         return next();
       } else {
         res.status(401).json({ error: "Invalid bearer token" });
         return;
       }
     })(req, res, next);
   } else if (apiKeyHeader) {
     // Use apiKeyAuth
     apiKeyAuth(req, res, () => {
       if ((req as any).user) {
         return next();
       } else {
         res.status(401).json({ error: "Invalid API key" });
         return;
       }
     });
   } else {
     res.status(401).json({ error: "No authentication provided" });
     return;
   }
 };