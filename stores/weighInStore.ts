import { asc, eq } from "drizzle-orm";

import { localDb } from "@/db";
import { weighIns } from "@/db/schema";

export const findWeighIns = async () => {
  const results = await localDb.query.weighIns.findMany({
    orderBy: [asc(weighIns.date)],
  });
  return results;
};

export const findWeighInsWithActivityId = async (activityId: number) => {
  const result = await localDb.query.weighIns.findFirst({
    where: eq(weighIns.activityId, activityId),
  });
  // tanstack doesn't like undefined so returning null
  console.log({ result });
  return result ?? null;
};
