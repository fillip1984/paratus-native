import { asc, eq } from "drizzle-orm";

import { localDb } from "@/db";
import { InferResultType } from "@/db/dbUtils";
import { routines, scheduledDays } from "@/db/schema";

export const findRoutines = async () => {
  const result = await localDb.query.routines.findMany({
    orderBy: [asc(routines.name)],
    with: { scheduledDays: true },
  });
  return result;
};

export const findRoutine = async (id: number) => {
  return await localDb.query.routines.findFirst({
    where: eq(routines.id, id),
    with: {
      scheduledDays: true,
    },
  });
};

export const addRoutine = async (routine: RoutineWithScheduledDays) => {
  const result = await localDb.transaction(async (tx) => {
    const routineResult = await tx
      .insert(routines)
      .values({
        name: routine.name,
        description: routine.description,
        startDate: routine.startDate,
        fromTime: routine.fromTime,
        toTime: routine.toTime,
        endDate: routine.endDate,
        repeat: routine.repeat,
        repeatEnds: routine.repeatEnds,
      })
      .returning();

    if (!routineResult) {
      throw Error("Failed to insert routine");
    }
    let scheduledDaysResult: SelectScheduledDay[] = [];
    if (routine.scheduledDays.length > 0) {
      scheduledDaysResult = await tx
        .insert(scheduledDays)
        .values(
          routine.scheduledDays.map((d) => {
            return { ...d, id: undefined, routineId: routineResult[0].id };
          }),
        )
        .returning();
    }
    return { routineResult, scheduledDays: scheduledDaysResult };
  });
  return result;
};

export const updateRoutine = async (routine: RoutineWithScheduledDays) => {
  const result = await localDb.transaction(async (tx) => {
    const routineResult = await tx
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
      .where(eq(routines.id, routine.id))
      .returning();

    if (!routineResult) {
      throw Error("Failed to update routine");
    }
    await tx
      .delete(scheduledDays)
      .where(eq(scheduledDays.routineId, routineResult[0].id));

    let scheduledDaysResult: SelectScheduledDay[] = [];
    if (routine.scheduledDays.length > 0) {
      console.log("inserting updated scheduled days");
      scheduledDaysResult = await tx
        .insert(scheduledDays)
        .values(
          routine.scheduledDays.map((d) => {
            return { ...d, id: undefined, routineId: routineResult[0].id };
          }),
        )
        .returning();
    }
    return { routineResult, scheduledDays: scheduledDaysResult };
  });
  return result;
};

export const deleteRoutine = async (id: number) => {
  await localDb.delete(routines).where(eq(routines.id, id));
  return true;
};

export type SelectRoutine = typeof routines.$inferSelect;
export type InsertRoutine = typeof routines.$inferInsert;
export type SelectScheduledDay = typeof scheduledDays.$inferSelect;
export type InsertScheduledDay = typeof scheduledDays.$inferInsert;

export type RoutineWithScheduledDays = InferResultType<
  "routines",
  { scheduledDays: true }
>;
