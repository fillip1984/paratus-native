import { asc, eq } from "drizzle-orm";

import { localDb } from "@/db";
import { todos } from "@/db/schema";
import { PromiseType, UnboxArray } from "@/utils/inference";

export type TodosSelect = UnboxArray<PromiseType<ReturnType<typeof findTodos>>>;

export const createTodos = async ({ text }: { text: string }) => {
  const [todo] = await localDb.insert(todos).values({ text }).returning();
  return todo;
};

export const findTodos = async () => {
  const result = await localDb.query.todos.findMany({
    orderBy: [asc(todos.createdAt)],
  });
  return result;
};

export const findTodo = async (todoId: number) => {
  return await localDb.query.todos.findFirst({
    where: eq(todos.id, todoId),
  });
};

export const toggleTodo = async (id: number, complete: boolean) => {
  return await localDb.update(todos).set({ complete }).where(eq(todos.id, id));
};

export const updateTodo = async (todoUpdates: TodosSelect) => {
  return await localDb
    .update(todos)
    .set({
      text: todoUpdates.text,
      timer: todoUpdates.timer,
      complete: todoUpdates.complete,
    })
    .where(eq(todos.id, todoUpdates.id));
};

export const deleteTodo = async (id: number) => {
  await localDb.delete(todos).where(eq(todos.id, id));
  return true;
};
