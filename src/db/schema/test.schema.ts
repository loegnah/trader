import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const testSchema = sqliteTable("test", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
});
