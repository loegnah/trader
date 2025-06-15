import { schema } from "@/db/schema";
import { ENV } from "@/env";
import { drizzle } from "drizzle-orm/bun-sqlite";

export const db = drizzle(ENV.DB_URL, { schema });
