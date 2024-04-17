import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const routines = sqliteTable("routine", {
  // TODO: try again in react-native 74, https://github.com/facebook/hermes/issues/948
  // id: text("id")
  //   .primaryKey()
  //   .$defaultFn(() => createId()),
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: text("startDate").notNull(),
  fromTime: text("fromTime").notNull(),
  toTime: text("toTime").notNull(),
  endDate: text("endDate"),
  repeat: integer("repeat", { mode: "boolean" }).default(false),
  repeatEnds: integer("repeatEnds", { mode: "boolean" }).default(false),
  // days:
  // skipInteractionType:
  // completeInteractionType:
});

export const routinesRelations = relations(routines, ({ many }) => ({
  scheduledDays: many(scheduledDays),
}));

export const scheduledDays = sqliteTable("scheduledDays", {
  id: integer("id").primaryKey(),
  label: text("label").notNull(),
  active: integer("selected", { mode: "boolean" }).notNull().default(false),
  routineId: integer("routine_id").notNull(),
});

export const scheduledDaysRelations = relations(scheduledDays, ({ one }) => ({
  routine: one(routines, {
    fields: [scheduledDays.routineId],
    references: [routines.id],
  }),
}));
