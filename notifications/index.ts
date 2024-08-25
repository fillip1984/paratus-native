import { format } from "date-fns";
import * as Notifications from "expo-notifications";
import { Notification } from "expo-notifications";

import { ActivityWithPartialRoutine } from "@/stores/activityStore";
import { h_mm_ampm } from "@/utils/date";

export interface notificationRequest {
  title: string;
  body: string;
  sound: boolean;
}

// TODO: add better input
export const scheduleNotificationForActivity = async (
  activity: ActivityWithPartialRoutine,
) => {
  console.log(
    `scheduling activity: ${activity.routine.name} to notify at: ${format(activity.start, h_mm_ampm)}`,
  );
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
  console.log(`Notification scheduled with id: ${scheduledId}`);
  return scheduledId;
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
