import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { deleteDatabaseSync, openDatabaseSync } from "expo-sqlite/next";

import * as schema from "./schema";
import migrations from "../drizzle/migrations";

const dbName = "paratus.db";
console.log("attempting to open sqlite database");
const rawDB = openDatabaseSync(dbName);
export const localDb = drizzle(rawDB, {
  schema,
  logger: false,
});

export const runMigrations = async () => {
  try {
    console.log("running migration");
    await migrate(localDb, migrations);
    console.log("ran migration");
  } catch (err) {
    console.error(
      "Exception thrown while attempting to run database migration scripts",
      err,
    );
    console.warn("attempting to recover by deleting the database");
    rawDB.closeSync();
    deleteDatabaseSync(dbName);
    console.warn("Deleted the database, try reloading");
  }
};
