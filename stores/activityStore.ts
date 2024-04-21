import {
  addDays,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  endOfYear,
  isAfter,
  isBefore,
  isSunday,
  isWithinInterval,
  nextSunday,
  parse,
  previousSunday,
  set,
  setDate,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { between, count, eq } from "drizzle-orm";

import { findRoutine } from "./routineStore";

import { localDb } from "@/db";
import {
  InsertActivity,
  RoutineWithScheduledDays,
  activities,
} from "@/db/schema";
import {
  HH_mm_aka24hr,
  combineDateAndTime,
  formatYYYY_MM_dd,
  yyyyMMddHyphenated,
} from "@/utils/date";

export const findActivities = async ({
  date,
  filter,
}: {
  date: Date;
  filter: string;
}) => {
  const start = startOfDay(date);
  const end = endOfDay(date);
  console.log({ start, end, date });
  const result = await localDb.query.activities.findMany({
    where: between(activities.start, start.toString(), end.toString()),
    limit: 100,
  });
  result.forEach((r) => console.log({ start: r.start, end: r.end }));
  console.log({ length: result.length, sample: result[0] });
  return result;
};

export const countActivities = async () => {
  return await localDb.select({ count: count() }).from(activities);
};

export const createActivitiesFromRoutine = async (routineId: number) => {
  await localDb.delete(activities);
  await deleteActivitiesForRoutine(routineId);
  const routine = await findRoutine(routineId);
  if (!routine) {
    throw Error(`Unable to find routine by id: ${routineId}`);
  }
  switch (routine.repeatCadence) {
    case null:
      return await createOneTimeActivity(routine);
    case "Daily":
      return await createDailyActivities(routine);
    case "Weekly":
      return await createWeeklyActivities(routine);
    case "Monthly":
      return await createMonthlyActivities(routine);
    case "Yearly":
      return await createYearlyActivities(routine);
    default:
      throw Error("Unsupported repeat cadence: " + routine.repeatCadence);
  }
};

const createOneTimeActivity = async (routine: RoutineWithScheduledDays) => {
  console.log("creating one time activity for routine", routine.name);

  //   const userTimezone = await getUserTimezone(userId);

  if (!routine.endDate) {
    throw new Error(
      "Unable to create one time activity from routine, missing end date. Routine: " +
        routine.id,
    );
  }

  // const startDate = parse(routine.startDate, yyyyMMddHyphenated, new Date());
  // const endDate = parse(routine.endDate, yyyyMMddHyphenated, new Date());

  const start = combineDateAndTime(
    routine.startDate,
    routine.fromTime,
    // userTimezone,
  );
  const end = combineDateAndTime(routine.endDate, routine.toTime);

  return await localDb.insert(activities).values({
    name: routine.name,
    description: routine.description,
    start,
    end,
    routineId: routine.id,
  });
};

const createDailyActivities = async (routine: RoutineWithScheduledDays) => {
  console.log("creating daily activities for routine", routine.name);

  const activitiesToAdd = [];

  //   const userTimezone = await getUserTimezone(userId);

  //   if (!routine.dailyEveryValue) {
  //     throw new Error(
  //       "Routine.dailyEveryValue (a.k.a. Every x days value) is not set",
  //     );
  //   }

  let startDate = parse(routine.startDate, yyyyMMddHyphenated, new Date());

  let endDate: Date;
  // if "Never end" is selected we build out activities for the given year.
  // An activity will ask on New Years if we should build out the new year or
  // if user wants to make adjustments
  if (!routine.repeatEnds) {
    endDate = endOfYear(startDate);
  } else if (routine.endDate) {
    endDate = parse(routine.endDate, yyyyMMddHyphenated, new Date());
  } else {
    throw new Error(
      "Unable to create daily activities from routine, missing end date (wasn't marked as never ending). Routine: " +
        routine.id,
    );
  }

  const fromTimeAsDate = parse(routine.fromTime, HH_mm_aka24hr, new Date());
  const toTimeAsDate = parse(routine.toTime, HH_mm_aka24hr, new Date());
  while (!isAfter(startDate, endDate)) {
    const start = set(startDate, {
      hours: fromTimeAsDate.getHours(),
      minutes: fromTimeAsDate.getMinutes(),
    });
    const end = set(startDate, {
      hours: toTimeAsDate.getHours(),
      minutes: toTimeAsDate.getMinutes(),
    });

    const act = {
      name: routine.name,
      description: routine.description,
      start: start.toISOString(),
      end: end.toISOString(),
      routineId: routine.id,
    };
    console.log({ act });
    activitiesToAdd.push(act);

    startDate = addDays(startDate, 1);
  }

  const result = await localDb.insert(activities).values(activitiesToAdd);
  console.log(
    `created ${result.changes} daily activities for routine: ${routine.name}`,
  );
};

const createWeeklyActivities = async (routine: RoutineWithScheduledDays) => {
  console.log("creating weekly activities for routine", routine.name);
  let datesToAdd: Date[] = [];

  //   const userTimezone = await getUserTimezone(userId);
  let startDate = parse(routine.startDate, yyyyMMddHyphenated, new Date());
  let endDate: Date;
  // if "Never end" is selected we build out activities for the given year.
  // An activity will ask on New Years if we should build out the new year or
  // if user wants to make adjustments
  if (!routine.repeatEnds) {
    endDate = endOfYear(startDate);
  } else if (routine.endDate) {
    endDate = parse(routine.endDate, yyyyMMddHyphenated, new Date());
  } else {
    throw new Error(
      "Unable to create weekly activities from routine, missing end date (wasn't marked as never ending). Routine: " +
        routine.id,
    );
  }
  const startEndInterval = { start: startDate, end: endDate };

  // set start to current week's sunday, will remove if out of range later
  if (!isSunday(startDate)) {
    startDate = previousSunday(startDate);
  }
  const selectedDays = routine.scheduledDays.filter((day) => day.active);

  while (!isAfter(startDate, endDate)) {
    selectedDays.forEach((day) => {
      if (day.label === "Sun") {
        datesToAdd.push(startDate);
      } else if (day.label === "Mon") {
        datesToAdd.push(addDays(startDate, 1));
      } else if (day.label === "Tue") {
        datesToAdd.push(addDays(startDate, 2));
      } else if (day.label === "Wed") {
        datesToAdd.push(addDays(startDate, 3));
      } else if (day.label === "Thur") {
        datesToAdd.push(addDays(startDate, 4));
      } else if (day.label === "Fri") {
        datesToAdd.push(addDays(startDate, 5));
      } else if (day.label === "Sat") {
        datesToAdd.push(addDays(startDate, 6));
      }
    });

    startDate = nextSunday(startDate);
  }

  // chop off out of range ranges
  datesToAdd = datesToAdd.filter((date) =>
    isWithinInterval(date, startEndInterval),
  );

  const activitiesToAdd: InsertActivity[] = [];
  datesToAdd.forEach((day) => {
    console.log({ day, fromTime: routine.fromTime });
    activitiesToAdd.push({
      name: routine.name,
      description: routine.description,
      start: combineDateAndTime(formatYYYY_MM_dd(day), routine.fromTime),
      end: combineDateAndTime(formatYYYY_MM_dd(day), routine.toTime),
      routineId: routine.id,
    });
  });

  const result = await localDb.insert(activities).values(activitiesToAdd);
  return result;
};

const createMonthlyActivities = async (routine: RoutineWithScheduledDays) => {
  console.log("creating monthly activities for routine", routine.name);

  const datesToAdd: Date[] = [];

  //   const userTimezone = await getUserTimezone(userId);

  const startDate = parse(routine.startDate, yyyyMMddHyphenated, new Date());
  let endDate: Date;
  // if "Never end" is selected we build out activities for the given year.
  // An activity will ask on New Years if we should build out the new year or
  // if user wants to make adjustments
  if (!routine.repeatEnds) {
    endDate = endOfYear(startDate);
  } else if (routine.endDate) {
    endDate = parse(routine.endDate, yyyyMMddHyphenated, new Date());
  } else {
    throw new Error(
      "Unable to create weekly activities from routine, missing end date (wasn't marked as never ending). Routine: " +
        routine.id,
    );
  }
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  months.forEach((month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthInterval = { start: monthStart, end: monthEnd };
    routine.scheduledDays
      .filter((day) => day.active)
      .map((day) => parseInt(day.label, 10))
      .map((day) => {
        // if month doesn't include selected day, put at end of month
        let date = setDate(month, day);
        if (!isWithinInterval(date, monthInterval)) {
          date = endOfMonth(month);
        }
        return date;
      })
      .filter((day) => isAfter(day, startDate) && isBefore(day, endDate))
      .forEach((day) => datesToAdd.push(day));
  });

  const activitiesToAdd = new Array(datesToAdd.length);
  datesToAdd.forEach((date) => {
    activitiesToAdd.push({
      name: routine.name,
      description: routine.description,
      start: combineDateAndTime(formatYYYY_MM_dd(date), routine.fromTime),
      end: combineDateAndTime(formatYYYY_MM_dd(date), routine.toTime),
      routineId: routine.id,
    });
  });

  return await localDb.insert(activities).values(activitiesToAdd);
};

const createYearlyActivities = async (routine: RoutineWithScheduledDays) => {
  console.log("creating yearly activities for routine", routine.name);

  if (!routine.scheduledDays[0]) {
    throw Error(
      "Unable to create yearly activities without scheduled days value",
    );
  }
  //   const userTimezone = await getUserTimezone(userId);
  const scheduledDay = parse(
    routine.scheduledDays[0].label,
    "MM/dd",
    new Date(),
  );

  if (!scheduledDay.getMonth()) {
    throw new Error(
      "Unable to create yearly activities without yearly month value, routine: " +
        routine.name,
    );
  }

  if (!scheduledDay.getDate()) {
    throw new Error(
      "Unable to create yearly activities without yearly day value, routine: " +
        routine.name,
    );
  }

  const startDate = parse(routine.startDate, yyyyMMddHyphenated, new Date());

  let endDate: Date;
  // if "Never end" is selected we build out activities for the given year.
  // An activity will ask on New Years if we should build out the new year or
  // if user wants to make adjustments
  if (!routine.repeatEnds) {
    endDate = endOfYear(startDate);
  } else if (routine.endDate) {
    endDate = parse(routine.endDate, yyyyMMddHyphenated, new Date());
  } else {
    throw new Error(
      "Unable to create weekly activities from routine, missing end date (wasn't marked as never ending). Routine: " +
        routine.id,
    );
  }

  const thisYear = { start: startDate, end: endDate };

  const activity = {
    name: routine.name,
    description: routine.description,
    start: combineDateAndTime(formatYYYY_MM_dd(scheduledDay), routine.fromTime),
    end: combineDateAndTime(formatYYYY_MM_dd(scheduledDay), routine.toTime),
    routineId: routine.id,
  };

  if (isWithinInterval(activity.start, thisYear)) {
    return await localDb.insert(activities).values(activity);
  }

  return null;
};

const deleteActivitiesForRoutine = async (id: number) => {
  await localDb.delete(activities).where(eq(activities.id, id));
  return true;
};
