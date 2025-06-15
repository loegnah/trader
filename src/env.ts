import dotenv from "dotenv";
import { z } from "zod/v4";

const zBoolean = () =>
  z.coerce.string().transform((val) => val.toLowerCase() === "true");

export const ENV = z
  .object({
    // Common
    IS_DEV: zBoolean().default(false),

    // DB
    DB_URL: z.string().default("file:./sqlite.db"),

    // Exchange
    BYBIT_API_KEY: z.string(),
    BYBIT_API_SECRET: z.string(),
    BYBIT_IS_DEMO_TRADING: zBoolean().default(false),
    BYBIT_IS_TESTNET: zBoolean().default(false),
  })
  .parse(dotenv.config({ path: [".env"] }).parsed);
