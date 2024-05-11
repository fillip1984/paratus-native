import { asc, eq } from "drizzle-orm";

import { localDb } from "@/db";
import { bloodPressureReadings } from "@/db/schema";

export const findBloodPressureReadings = async () => {
  const results = await localDb.query.bloodPressureReadings.findMany({
    orderBy: [asc(bloodPressureReadings.date)],
  });
  return results;
};

export const findBloodPressureReadingWithActivityId = async (
  activityId: number,
) => {
  const result = await localDb.query.bloodPressureReadings.findFirst({
    where: eq(bloodPressureReadings.activityId, activityId),
  });
  return result;
};
