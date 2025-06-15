import { ENV } from "@/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  out: "./drizzle",
  schema: "./src/db/schema/*.schema.ts",
  dbCredentials: {
    url: ENV.DB_URL,
  },
});
