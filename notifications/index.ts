import * as Notifications from "expo-notifications";
import { Notification } from "expo-notifications";

export interface notificationRequest {
  title: string;
  body: string;
  sound: boolean;
}

// TODO: add better input
export const scheduleNotification = async (seconds: number) => {
  const schedulingOptions = {
    content: {
      title: "This is a notification",
      body: "This is the body",
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: "blue",
    },
    trigger: {
      seconds,
    },
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
