import { config as dotenvConfig } from "dotenv";
import { ENV } from "./types/env";

dotenvConfig({
  path: `.env.${process.env.NODE_ENV}`,
  debug: process.env.NODE_ENV !== "prod",
});

const environment = ENV.parse({
  ...process.env,
});

export default environment;
