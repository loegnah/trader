import { testSchema } from "@/db/schema/test.schema";
import { ENV } from "@/env";
import { drizzle } from "drizzle-orm/bun-sqlite";

export const dbSchema = {
  testSchema,
};

export const db = drizzle(ENV.DB_URL, { schema: dbSchema });
