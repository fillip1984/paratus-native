import { asc, eq } from "drizzle-orm";

import { localDb } from "@/db";
import { notes } from "@/db/schema";

export const findNotes = async () => {
  const results = await localDb.query.notes.findMany({
    orderBy: [asc(notes.date)],
  });
  return results;
};

export const findNoteWithActivityId = async (activityId: number) => {
  const result = await localDb.query.notes.findFirst({
    where: eq(notes.activityId, activityId),
  });
  // tanstack doesn't like undefined so returning null
  return result ?? null;
};
