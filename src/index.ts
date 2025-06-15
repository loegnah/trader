import { db } from "@/db";
import { ENV } from "@/env";

console.log(ENV);
console.log(await db.query.testSchema.findMany());
