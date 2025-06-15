import dotenv from "dotenv";
import { z } from "zod/v4";

const zBoolean = () =>
  z.coerce.string().transform((val) => val.toLowerCase() === "true");

export const ENV = z
  .object({
    IS_DEV: zBoolean().default(false),
    DB_URL: z.string().default("file:./sqlite.db"),
  })
  .parse(dotenv.config({ path: [".env"] }).parsed);
