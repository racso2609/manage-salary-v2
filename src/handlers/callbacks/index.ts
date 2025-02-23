import { NextFunction, Request, Response } from "express";

export const asyncHandler =
  (asyncFn: Function) => (req: Request, res: Response, next: NextFunction) => {
    return asyncFn(req, res, next).catch((e) => {
      return next(e);
    });
  };
