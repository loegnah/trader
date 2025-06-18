import dotenv from "dotenv";
import { z } from "zod/v4";

const zBoolean = () =>
  z.coerce.string().transform((val) => val.toLowerCase() === "true");

const zLogLevel = () => z.enum(["trace", "debug", "info", "warn", "error"]);

export const ENV = z
  .object({
    // Common
    IS_DEV: zBoolean().default(false),

    // Logger
    LOG_LEVEL_CONSOLE: zLogLevel().default("trace"),
    LOG_IS_FILE_SAVE: zBoolean().default(false),
    LOG_LEVEL_FILE: zLogLevel().default("trace"),

    // DB
    DB_URL: z.string().default("file:./sqlite.db"),

    // Exchange
    BYBIT_API_KEY: z.string(),
    BYBIT_API_SECRET: z.string(),
    BYBIT_IS_DEMO_TRADING: zBoolean().default(false),
    BYBIT_IS_TESTNET: zBoolean().default(false),
  })
  .parse(dotenv.config({ path: [".env"] }).parsed);
