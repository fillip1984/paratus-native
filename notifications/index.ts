import { addMinutes } from "date-fns";
import * as Notifications from "expo-notifications";
import { Notification } from "expo-notifications";

import { ActivityWithPartialRoutine } from "@/stores/activityStore";
import { TodosSelect } from "@/stores/todoStore";

export interface notificationRequest {
  title: string;
  body: string;
  sound: boolean;
}

// TODO: add better input
export const scheduleNotificationForActivity = async (
  activity: ActivityWithPartialRoutine,
) => {
  const schedulingOptions = {
    content: {
      title: activity.routine.name,
      body: activity.routine.name,
      data: {
        activityId: activity.id,
      },
    },
    trigger: activity.start,
  };
  const scheduledId =
    await Notifications.scheduleNotificationAsync(schedulingOptions);
  return scheduledId;
};

export const scheduleNotificationForTodo = async (todo: TodosSelect) => {
  if (!todo.timer) {
    console.warn("No timer set");
    return;
  }

  const notificationTime = addMinutes(new Date(), todo.timer);
  const schedulingOptions = {
    content: {
      title: "Todo complete",
      body: todo.text,
      interruptionLevel: "timeSensitive",
      sound: true,
      data: { todoId: todo.id },
    } as Notifications.NotificationContentInput,
    trigger: notificationTime,
  };
  const scheduledId =
    await Notifications.scheduleNotificationAsync(schedulingOptions);
  return scheduledId;
};

export const unscheduleNotificationsForTodo = async (
  todoId: number,
  excluding?: string,
) => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  notifications.forEach((n) => {
    const data = n.content.data;
    if (data.todoId === todoId) {
      if (n.identifier !== excluding) {
        Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  });
};

/**
 * Handles notifications should we receive one and the application is already open
 * @param notification
 */
export const handleNotification = (notification: Notification) => {
  // TODO: implement, this is what we do when a notification is fired and the app is open
  const { title } = notification.request.content;
  console.warn(title);
};
