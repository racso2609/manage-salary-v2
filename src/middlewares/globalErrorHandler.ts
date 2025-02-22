import environment from "@/env";
import { logger } from "@/handlers/Loggers";
import { Response, Request } from "express";

const sendErrorDevelopment = (error, res: Response) => {
  logger.error(error);
  res.status(error.statusCode || 500).json({
    status: error.status || "error",
    message: error.message,
    stack: error.stack,
    error,
  });
};

const sendErrorProduction = (error, res: Response) => {
  logger.error(error);
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

export const globalErrorController = (
  error,
  _req: Request,
  res: Response,
  // _next: NextFunction,
) => {
  if (environment.NODE_ENV === "dev") sendErrorDevelopment(error, res);
  sendErrorDevelopment(error, res);
  if (environment.NODE_ENV === "prod") sendErrorProduction(error, res);
};
