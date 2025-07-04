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

    // Discord
    DISCORD_IS_RUN: zBoolean().default(false),
    DISCORD_USER_ID: z.string(),
    DISCORD_BOT_ID: z.string(),
    DISCORD_BOT_TOKEN: z.string(),
    DISCORD_BOT_CMD_LISTEN: zBoolean().default(false),
    DISCORD_BOT_CMD_RESET: zBoolean().default(false),
    DISCORD_BOT_SEND_MSG: zBoolean().default(false),

    // Telegram
    TELEGRAM_BOT_TOKEN: z.string(),
    TELEGRAM_BOT_CHAT_ID: z.string(),

    // ---------------------- Bot ----------------------

    // Outlier
    OUTLIER_RUN: zBoolean().default(false),
    OUTLIER_MSG_TTL: z.coerce.number(),
    OUTLIER_RESET_STATE: zBoolean().default(false),
    OUTLIER_BYBIT_API_KEY: z.string(),
    OUTLIER_BYBIT_API_SECRET: z.string(),
    OUTLIER_BYBIT_IS_DEMO_TRADING: zBoolean().default(false),
    OUTLIER_BYBIT_IS_TESTNET: zBoolean().default(false),

    // Dopamine
    DOPAMINE_RUN: zBoolean().default(false),
    DOPAMINE_BYBIT_API_KEY: z.string(),
    DOPAMINE_BYBIT_API_SECRET: z.string(),
    DOPAMINE_BYBIT_IS_DEMO_TRADING: zBoolean().default(false),
    DOPAMINE_BYBIT_IS_TESTNET: zBoolean().default(false),
  })
  .parse(dotenv.config({ path: [".env"] }).parsed);
