import dotenv from "dotenv";
import { z } from "zod/v4";

const zBoolean = () =>
  z.coerce.string().transform((val) => val.toLowerCase() === "true");

export const ENV = z
  .object({
    ENV_TEST_1: z.string().default("default"),
    ENV_TEST_2: zBoolean().default(false),
  })
  .parse(dotenv.config({ path: [".env"] }).parsed);
