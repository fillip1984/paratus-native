import { asc, eq } from "drizzle-orm";

import { localDb } from "@/db";
import { routines } from "@/db/schema";

export const findRoutines = async () => {
  return await localDb.query.routines.findMany({
    orderBy: [asc(routines.name)],
  });
};

export const findRoutine = async (id: number) => {
  return await localDb.query.routines.findFirst({
    where: eq(routines.id, id),
  });
};

export const addRoutine = async (routine: InsertRoutine) => {
  return await localDb.insert(routines).values({
    name: routine.name,
    description: routine.description,
    startDate: routine.startDate,
    fromTime: routine.fromTime,
    toTime: routine.toTime,
    endDate: routine.endDate,
    repeat: routine.repeat,
    repeatEnds: routine.repeatEnds,
  });
};

export const updateRoutine = async (routine: SelectRoutine) => {
  return await localDb
    .update(routines)
    .set({
      name: routine.name,
      description: routine.description,
      startDate: routine.startDate,
      fromTime: routine.fromTime,
      toTime: routine.toTime,
      endDate: routine.endDate,
      repeat: routine.repeat,
      repeatEnds: routine.repeatEnds,
    })
    .where(eq(routines.id, routine.id));
};

export const deleteRoutine = async (id: number) => {
  await localDb.delete(routines).where(eq(routines.id, id));
  return true;
};

export type SelectRoutine = typeof routines.$inferSelect;
export type InsertRoutine = typeof routines.$inferInsert;
