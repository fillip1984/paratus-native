import { relations, sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export const routines = sqliteTable("routine", {
  // TODO: try again in react-native 74, https://github.com/facebook/hermes/issues/948
  // id: text("id")
  //   .primaryKey()
  //   .$defaultFn(() => createId()),
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: integer("startDate", { mode: "timestamp" }).notNull(),
  fromTime: text("fromTime").notNull(),
  toTime: text("toTime").notNull(),
  endDate: integer("endDate", { mode: "timestamp" }),
  repeat: integer("repeat", { mode: "boolean" }).default(false),
  repeatEnds: integer("repeatEnds", { mode: "boolean" }).default(false),
  repeatCadence: text("repeatCadence", {
    enum: ["Daily", "Weekly", "Monthly", "Yearly"],
  }),
  // onSkip: skipInteractionType??
  onComplete: text("onComplete", {
    enum: ["BloodPressure", "None", "Note", "Run", "WeighIn"],
  })
    .default("None")
    .notNull(),
});

export const routinesRelations = relations(routines, ({ many }) => ({
  scheduledDays: many(scheduledDays),
  activities: many(activities),
}));

export const scheduledDays = sqliteTable("scheduledDay", {
  id: integer("id").primaryKey(),
  label: text("label").notNull(),
  active: integer("selected", { mode: "boolean" }).notNull().default(false),
  // TODO: onDelete cascade isn't working
  routineId: integer("routine_id")
    .references(() => routines.id, { onDelete: "cascade" })
    .notNull(),
});

export const scheduledDaysRelations = relations(scheduledDays, ({ one }) => ({
  routine: one(routines, {
    fields: [scheduledDays.routineId],
    references: [routines.id],
  }),
}));

export const activities = sqliteTable("activity", {
  id: integer("id").primaryKey(),
  start: integer("start", { mode: "timestamp" }).notNull(),
  end: integer("end", { mode: "timestamp" }).notNull(),
  complete: integer("complete", { mode: "boolean" }).default(false),
  skipped: integer("skipped", { mode: "boolean" }).default(false),
  routineId: integer("routine_id")
    .references(() => routines.id, { onDelete: "cascade" })
    .notNull(),
  // bloodPressureReading: integer("bloodPressureReading_id").references(
  //   () => bloodPressureReadings.id,
  //   {
  //     onDelete: "cascade",
  //   },
  // ),
  // weighIn: integer("weighIn_id").references(() => weighIns.id, {
  //   onDelete: "cascade",
  // }),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  routine: one(routines, {
    fields: [activities.routineId],
    references: [routines.id],
  }),
}));

export const weighIns = sqliteTable(
  "weighIn",
  {
    id: integer("id").primaryKey(),
    date: integer("date", { mode: "timestamp" }).notNull(),
    weight: real("weight").notNull(),
    bodyFatPercentage: real("bodyFatPercentage"),
    activityId: integer("activity_id")
      .references(() => activities.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    unq: unique().on(t.activityId),
  }),
);

export const weighInsRelations = relations(weighIns, ({ one }) => ({
  activity: one(activities, {
    fields: [weighIns.activityId],
    references: [activities.id],
  }),
}));

export const weightGoal = sqliteTable("weightGoal", {
  id: integer("id").primaryKey(),
  weight: real("weight").notNull(),
  activity: integer("activity_id")
    .references(() => activities.id, { onDelete: "cascade" })
    .notNull(),
});

export const bloodPressureReadings = sqliteTable(
  "bloodPressureReading",
  {
    id: integer("id").primaryKey(),
    date: integer("date", { mode: "timestamp" }).notNull(),
    systolic: integer("systolic").notNull(),
    diastolic: integer("diastolic").notNull(),
    pulse: integer("pulse"),
    activityId: integer("activity_id")
      .references(() => activities.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    unq: unique().on(t.activityId),
  }),
);

export const bloodPressureReadingsRelations = relations(
  bloodPressureReadings,
  ({ one }) => ({
    activity: one(activities, {
      fields: [bloodPressureReadings.activityId],
      references: [activities.id],
    }),
  }),
);

export const notes = sqliteTable(
  "note",
  {
    id: integer("id").primaryKey(),
    date: integer("date", { mode: "timestamp" }).notNull(),
    body: text("body").notNull(),
    activityId: integer("activity_id")
      .references(() => activities.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    unq: unique().on(t.activityId),
  }),
);

export const noteRelations = relations(notes, ({ one }) => ({
  activity: one(activities, {
    fields: [notes.activityId],
    references: [activities.id],
  }),
}));

export type SelectRoutine = typeof routines.$inferSelect;
// export type InsertRoutine = typeof routines.$inferInsert;
export type SelectScheduledDay = typeof scheduledDays.$inferSelect;
// export type InsertScheduledDay = typeof scheduledDays.$inferInsert;
// export type SelectActivity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

export type InsertBloodPressureReading =
  typeof bloodPressureReadings.$inferInsert;
export type SelectBloodPressureReading =
  typeof bloodPressureReadings.$inferSelect;
export type InsertWeighIn = typeof weighIns.$inferInsert;

export type InsertNote = typeof notes.$inferInsert;

// export type RoutineWithScheduledDays = InferResultType<
//   "routines",
//   { scheduledDays: true }
// >;

// export type ActivityWithRoutine = InferResultType;

export const todos = sqliteTable("todo", {
  id: integer("id").primaryKey(),
  createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  text: text("text").notNull(),
  timer: integer("timer").default(0),
  complete: integer("complete", { mode: "boolean" }).default(false),
});

export type RepeatCadenceType =
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Yearly"
  | null;

export type ActivityCompleteType =
  | "BloodPressure"
  | "None"
  | "Note"
  | "Run"
  | "WeighIn";

export type ActivityFilterType = "Available" | "Complete" | "Skipped" | "All";
