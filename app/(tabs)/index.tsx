import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList, ViewToken } from "@shopify/flash-list";
import classNames from "classnames";
import {
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  format,
  Interval,
  interval,
  isFuture,
  isPast,
  isSameDay,
  isToday,
  isTomorrow,
  isWithinInterval,
  isYesterday,
  startOfDay,
  startOfWeek,
} from "date-fns";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Link, router, useFocusEffect } from "expo-router";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { NatureCard } from "../_components/NatureCard";
import TimelineCard from "../_components/TimelineCard";

import { scheduleNotificationForActivity } from "@/notifications";
import {
  ActivityWithPartialRoutine,
  completeActivity,
  findActivities,
  skipActivity,
} from "@/stores/activityStore";
import fetchSunInfo, { SunInfo } from "@/stores/sunInfoStore";

interface TimelineEntry {
  type: "sunrise" | "sunset" | "nature" | "todo" | "activity" | "header";
  date: Date;
  activity?: ActivityWithPartialRoutine;
  sunInfo?: SunInfo;
}

export default function Home() {
  const today = new Date();
  const sunday = startOfWeek(today);
  const saturday = endOfWeek(today);
  const thisWeek = interval(sunday, saturday);
  const lastWeek = interval(addWeeks(sunday, -1), addWeeks(saturday, -1));
  const nextWeek = interval(addWeeks(sunday, 1), addWeeks(saturday, 1));

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [agendaDate, setAgendaDate] = useState<Date>(new Date());
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [headers, setHeaders] = useState<number[]>([]);

  const fetchNatureInfo = async (date: Date) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn(
        "Permission wasn't granted for GSP/location so unable to fetch sun info",
      );
      return;
    }

    try {
      const location = await Location.getLastKnownPositionAsync();
      if (!location) {
        console.warn("Unable to get location info so unable to fetch sun info");
        return;
      }

      const sunInfo = await fetchSunInfo(
        date,
        location.coords.latitude,
        location.coords.longitude,
      );
      return sunInfo;
    } catch (err) {
      console.warn(
        "Failed to fetch sun info, purposefully ignoring unresolved promises and errors while fetching sun info so the rest of activities are shown",
        err,
      );
    }
  };

  const fetchData = async () => {
    const activities = await findActivities({
      start: startOfDay(lastWeek.start),
      end: endOfDay(nextWeek.end),
    });

    const newTimeline = [] as TimelineEntry[];
    for (const d of eachDayOfInterval({
      start: lastWeek.start,
      end: nextWeek.end,
    })) {
      newTimeline.push({ type: "header", date: d } as TimelineEntry);
      const sunInfo = await fetchNatureInfo(d);
      if (sunInfo) {
        newTimeline.push({ type: "sunrise", date: d, sunInfo });
      }
      activities
        .filter((a) => isSameDay(a.start, d))
        .forEach((a) =>
          newTimeline.push({
            type: "activity",
            date: d,
            activity: a,
          } as TimelineEntry),
        );
      if (sunInfo) {
        newTimeline.push({ type: "sunset", date: d, sunInfo });
      }
    }

    setTimeline(newTimeline);
    setHeaders(
      newTimeline
        .map((t, i) => (t.type === "header" ? i : -1))
        .filter((t) => t !== -1),
    );
  };

  useEffect(() => {
    const scheduleStuff = async () => {
      const notifications =
        await Notifications.getAllScheduledNotificationsAsync();
      timeline
        ?.filter((t) => t.type === "activity")
        .map((t) => t.activity)
        .forEach((act) => {
          if (act) {
            const cancel = notifications.filter(
              (n) => n.content.data.activityId === act.id,
            );
            cancel.forEach((c) =>
              Notifications.cancelScheduledNotificationAsync(c.identifier),
            );
            if (act.routine) {
              scheduleNotificationForActivity(act);
            }
          }
        });
    };
    scheduleStuff();
  }, [timeline]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const handleCompleteOrSkip = async (
    activity: ActivityWithPartialRoutine,
    action: "Complete" | "Skip",
  ) => {
    switch (action) {
      case "Complete":
        handleComplete(activity);
        setTimeline((prev) =>
          prev.filter((t) => t.activity?.id !== activity.id),
        );
        Promise.resolve();
        break;
      case "Skip":
        await skipActivity(activity.id);
        setTimeline((prev) =>
          prev.filter((t) => t.activity?.id !== activity.id),
        );
        Promise.resolve();
        break;
      default:
        Promise.reject(
          Error(
            "Unexpected action, was expecting Complete or Skip only, received: " +
              action +
              " on activity: " +
              activity.routine.name,
          ),
        );
    }
  };

  const handleComplete = async (activity: ActivityWithPartialRoutine) => {
    switch (activity.routine.onComplete) {
      case "None":
        await completeActivity(activity.id);
        break;
      case "BloodPressure":
        router.push(`/(modals)/interactions/bloodPressure/${activity.id}`);
        break;
      case "Note":
        router.push(`/(modals)/interactions/note/${activity.id}`);
        break;
      case "Run":
        router.push("/(modals)/interactions/runModal");
        break;
      case "WeighIn":
        router.push(`/(modals)/interactions/weighIn/${activity.id}`);
        break;
      default:
        throw Error(`Unconfigured outcome: ${activity.routine.onComplete}`);
    }
  };

  return (
    // TODO: still can't figure out how to style the safe area's text. Tried StatusBar from expo but can't get it to comply
    <SafeAreaView className="bg-black">
      <View className="flex h-screen gap-2">
        <Header
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          agendaDate={agendaDate}
          setAgendaDate={setAgendaDate}
          lastWeek={lastWeek}
          thisWeek={thisWeek}
          nextWeek={nextWeek}
          today={today}
        />
        <Timeline
          timeline={timeline}
          headers={headers}
          handleCompleteOrSkip={handleCompleteOrSkip}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setAgendaDate={setAgendaDate}
        />
      </View>
    </SafeAreaView>
  );
}

const Header = ({
  selectedDate,
  setSelectedDate,
  agendaDate,
  setAgendaDate,
  lastWeek,
  thisWeek,
  nextWeek,
  today,
}: {
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  agendaDate: Date;
  setAgendaDate: Dispatch<SetStateAction<Date>>;
  lastWeek: Interval;
  thisWeek: Interval;
  nextWeek: Interval;
  today: Date;
}) => {
  const scrollViewRef = useRef<FlashList<Interval<Date>>>(null);

  useEffect(() => {
    const item = [lastWeek, thisWeek, nextWeek].find((w) =>
      isWithinInterval(selectedDate, w),
    );
    const item2 = [lastWeek, thisWeek, nextWeek].find((w) =>
      isWithinInterval(agendaDate, w),
    );

    // if (item2 && item !== item2) {
    // scrollViewRef.current?.scrollToItem({ item, animated: true });
    // scrollViewRef.current?.scrollToItem({ item: item2, animated: true });
    // } else if (item) {
    scrollViewRef.current?.scrollToItem({ item, animated: true });
    // }
  }, [selectedDate, agendaDate, lastWeek, thisWeek, nextWeek]);

  return (
    <View>
      <View className="mb-2 flex flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-2">
          <Text className="text-xl text-white">
            {format(selectedDate, "MMM yyyy")} &gt;
          </Text>
          <Pressable
            onPress={() => {
              setSelectedDate(today);
            }}
            className="relative">
            <Ionicons name="calendar-clear-outline" size={32} color="#ef4444" />
            <Text className="absolute right-2 top-3 text-red-500">
              {format(today, "d")}
            </Text>
          </Pressable>
        </View>
        <Avatar />
      </View>

      <View className="h-24">
        <FlashList
          data={[lastWeek, thisWeek, nextWeek]}
          renderItem={({ item }) => (
            <Week
              week={item}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              agendaDate={agendaDate}
              setAgendaDate={setAgendaDate}
            />
          )}
          estimatedItemSize={334}
          horizontal
          pagingEnabled
          ref={scrollViewRef}
        />
      </View>
    </View>
  );
};

const Week = ({
  week,
  selectedDate,
  setSelectedDate,
  agendaDate,
  setAgendaDate,
}: {
  week: Interval;
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  agendaDate: Date;
  setAgendaDate: Dispatch<SetStateAction<Date>>;
}) => {
  const isSelected = (d: Date) => {
    return isSameDay(d, agendaDate);
  };

  return (
    <View className="flex w-screen flex-row">
      {eachDayOfInterval(week).map((d) => (
        <View key={d.getDate()} className="flex flex-1 items-center gap-4">
          <Text className="text-white">{format(d, "E")}</Text>
          <Pressable
            onPress={() => {
              setSelectedDate(d);
              setAgendaDate(d);
            }}
            className={classNames({
              "flex h-10 w-10 items-center justify-center rounded-full bg-red-500":
                // isSameDay(selectedDate, d) &&
                isSameDay(agendaDate, d),
              "flex h-10 w-10 items-center justify-center": true,
            })}>
            <Text
              className={classNames("text-2xl", {
                "text-red-500": isToday(d) && !isSelected(d),
                "text-white": isFuture(d) || isSelected(d),
                "text-gray-600": isPast(d) && !isToday(d),
              })}>
              {d.getDate()}
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
};

const Avatar = () => {
  return (
    <Link href="/(modals)/preferences" asChild>
      <Pressable className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-400">
        <Text>PH</Text>
      </Pressable>
    </Link>
  );
};

const Timeline = ({
  timeline,
  headers,
  handleCompleteOrSkip,
  selectedDate,
  setSelectedDate,
  setAgendaDate,
}: {
  timeline: TimelineEntry[];
  headers: number[];
  handleCompleteOrSkip: (
    activity: ActivityWithPartialRoutine,
    action: "Complete" | "Skip",
  ) => Promise<void>;
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  setAgendaDate: Dispatch<SetStateAction<Date>>;
}) => {
  const agendaScrollViewRef = useRef<FlashList<TimelineEntry>>(null);

  const todayIndex = timeline.findIndex(
    (t) => t.type === "header" && isSameDay(t.date, new Date()),
  );

  // TODO: Not perfect, either we need to introduce a debouncer here or go back to having 1 variable to indicate selected date and have explicit scroll to happen what that's a hell of a lot of reverse prop drilling though it's probably the best option
  const viewableItemsHandler = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        const visibleDate = (viewableItems[0].item as TimelineEntry).date;
        console.log("setting agenda date: " + visibleDate);
        setAgendaDate(visibleDate);
      }
    },
    [setAgendaDate],
  );

  useEffect(() => {
    const item = timeline.find(
      (t) => t.type === "header" && isSameDay(t.date, selectedDate),
    );
    if (item !== undefined) {
      console.log("Scrolling to selected date: " + selectedDate);
      agendaScrollViewRef.current?.scrollToItem({ item, animated: true });
    }
  }, [selectedDate, timeline]);

  return (
    <View className="flex-1">
      <GestureHandlerRootView>
        {todayIndex !== -1 && (
          <FlashList
            data={timeline}
            estimatedItemSize={94.6}
            initialScrollIndex={todayIndex}
            renderItem={({ item }) => (
              <TimelineCardResolver
                timelineEntry={item}
                handleCompleteOrSkip={handleCompleteOrSkip}
              />
            )}
            ref={agendaScrollViewRef}
            stickyHeaderHiddenOnScroll
            stickyHeaderIndices={headers}
            // See: https://stackoverflow.com/questions/45868284/how-to-get-currently-visible-index-in-rn-flat-list
            onViewableItemsChanged={viewableItemsHandler}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          />
        )}
      </GestureHandlerRootView>
    </View>
  );
};

const TimelineCardResolver = ({
  timelineEntry,
  handleCompleteOrSkip,
}: {
  timelineEntry: TimelineEntry;
  handleCompleteOrSkip: (
    activity: ActivityWithPartialRoutine,
    action: "Complete" | "Skip",
  ) => Promise<void>;
}) => {
  if (timelineEntry.type === "header") {
    return (
      <View
        // onLayout={(e) => {
        //   const layout = e.nativeEvent.layout;
        //   setDayCoordinates((prev) => [
        //     ...prev,
        //     { date: timelineEntry.date, y: layout.y },
        //   ]);
        // }}
        // key={timelineEntry.date.toISOString() + timelineEntry.type}
        className="bg-black">
        <Text className="py-2 text-xl font-bold text-white">
          {format(timelineEntry.date, "MMM dd")}{" "}
          <Entypo name="dot-single" size={24} color="white" />
          {isYesterday(timelineEntry.date) ? (
            <>
              Yesterday
              <Entypo name="dot-single" size={24} color="white" />
            </>
          ) : (
            ""
          )}
          {isToday(timelineEntry.date) ? (
            <>
              Today
              <Entypo name="dot-single" size={24} color="white" />
            </>
          ) : (
            ""
          )}
          {isTomorrow(timelineEntry.date) ? (
            <>
              Tomorrow
              <Entypo name="dot-single" size={24} color="white" />
            </>
          ) : (
            ""
          )}
          {format(timelineEntry.date, "EEEE")}
        </Text>
      </View>
    );
  } else if (timelineEntry.type === "activity" && timelineEntry.activity) {
    return (
      <TimelineCard
        // key={timelineEntry.activity.id}
        activity={timelineEntry.activity}
        handleCompleteOrSkip={handleCompleteOrSkip}
      />
    );
  } else if (
    (timelineEntry.type === "sunrise" || timelineEntry.type === "sunset") &&
    timelineEntry.sunInfo
  ) {
    return (
      <NatureCard
        // key={timelineEntry.date.toISOString() + timelineEntry.type}
        nature={timelineEntry.sunInfo}
        type={timelineEntry.type}
      />
    );
  } else {
    return (
      <View>
        <Text className="font-bold text-white">Unknown timeline entry</Text>
      </View>
    );
  }
};
