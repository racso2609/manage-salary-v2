import express from "express";
import environment from "./env";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { logger } from "./handlers/Loggers";
import { globalErrorController } from "./middlewares/globalErrorHandler";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(helmet());
app.use(cors());
app.use(mongoSanitize());

const loggerProfiler = ["dev", "test"].includes(environment.NODE_ENV)
  ? "dev"
  : "combined";

const accessLogStream =
  loggerProfiler === "combined"
    ? fs.createWriteStream(
        path.join(__dirname, "..", `${environment.NODE_ENV}.log`),
        {
          flags: "a",
        },
      )
    : undefined;

// Log requests to the console and write to file
app.use(morgan(loggerProfiler, { stream: accessLogStream }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});

app.use(limiter);
app.use(globalErrorController);

app.listen(environment.PORT, () => {
  logger.log(`Server listening on port: ${environment.PORT}`);
});

export default app;
