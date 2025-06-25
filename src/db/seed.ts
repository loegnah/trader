import { dbSchema } from "@/db";
import { ENV } from "@/env";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { reset, seed } from "drizzle-seed";

async function doSeed() {
  if (!ENV.IS_DEV) {
    console.error("This script is only available in development mode.");
    return;
  }
  console.log("[Seeding] Start");

  const db = drizzle(ENV.DB_URL);
  await reset(db, dbSchema);
  await seed(db, dbSchema);

  console.log("[Seeding] Done");
}

doSeed();
