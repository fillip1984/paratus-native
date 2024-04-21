import { asc, eq } from "drizzle-orm";

import { localDb } from "@/db";
import { SelectScheduledDay, routines, scheduledDays } from "@/db/schema";
import { PromiseType, UnboxArray } from "@/utils/inference";

export type RoutineWithScheduledDays = UnboxArray<
  PromiseType<ReturnType<typeof findRoutines>>
>;

export const findRoutines = async () => {
  const result = await localDb.query.routines.findMany({
    orderBy: [asc(routines.name)],
    with: { scheduledDays: true },
  });
  return result;
};

export const findRoutine = async (id: number) => {
  const result = await localDb.query.routines.findFirst({
    where: eq(routines.id, id),
    with: {
      scheduledDays: true,
    },
  });

  return result;
};

export const createRoutine = async (routine: RoutineWithScheduledDays) => {
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
        repeatCadence: routine.repeatCadence,
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
        repeatCadence: routine.repeatCadence,
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
  await localDb.transaction(async (tx) => {
    // TODO: having to delete scheduled days since cascade isn't working
    await tx.delete(scheduledDays).where(eq(scheduledDays.routineId, id));
    await tx.delete(routines).where(eq(routines.id, id));
  });
  return true;
};
