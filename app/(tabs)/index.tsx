import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList, ViewToken } from "@shopify/flash-list";
import classNames from "classnames";
import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  format,
  Interval,
  interval,
  isBefore,
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
import { useDebounceCallback } from "usehooks-ts";

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
  type:
    | "sunrise"
    | "sunset"
    | "nature"
    | "todo"
    | "activity"
    | "header"
    | "spacer";
  date: Date;
  activity?: ActivityWithPartialRoutine;
  sunInfo?: SunInfo;
}

export default function Home() {
  const today = startOfDay(new Date());
  const sunday = startOfWeek(today);
  const saturday = endOfWeek(today);
  const thisWeek = interval(sunday, saturday);
  const lastWeek = interval(addWeeks(sunday, -1), addWeeks(saturday, -1));
  const nextWeek = interval(addWeeks(sunday, 1), addWeeks(saturday, 1));

  const [selectedDate, setSelectedDate] = useState(today);
  const [jumpToDate, setJumpToDate] = useState<Date | null>(null);
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
    newTimeline.push({ type: "spacer", date: nextWeek.end });
    newTimeline.push({ type: "spacer", date: nextWeek.end });
    newTimeline.push({ type: "spacer", date: nextWeek.end });
    newTimeline.push({ type: "spacer", date: nextWeek.end });
    newTimeline.push({ type: "spacer", date: nextWeek.end });
    newTimeline.push({ type: "spacer", date: nextWeek.end });

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
          setJumpToDate={setJumpToDate}
          lastWeek={lastWeek}
          thisWeek={thisWeek}
          nextWeek={nextWeek}
          today={today}
        />
        <Timeline
          timeline={timeline}
          headers={headers}
          handleCompleteOrSkip={handleCompleteOrSkip}
          setSelectedDate={setSelectedDate}
          jumpToDate={jumpToDate}
          setJumpToDate={setJumpToDate}
        />
      </View>
    </SafeAreaView>
  );
}

const Header = ({
  selectedDate,
  setSelectedDate,
  setJumpToDate,
  lastWeek,
  thisWeek,
  nextWeek,
  today,
}: {
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  setJumpToDate: Dispatch<SetStateAction<Date | null>>;
  lastWeek: Interval;
  thisWeek: Interval;
  nextWeek: Interval;
  today: Date;
}) => {
  const scrollViewRef = useRef<FlashList<Interval<Date>>>(null);

  const [activeWeek, setActiveWeek] = useState<Interval<Date>>();

  useEffect(() => {
    // console.log({ msg: "header version", selectedDate });
    const item = [lastWeek, thisWeek, nextWeek].find((w) =>
      isWithinInterval(selectedDate, w),
    );

    scrollViewRef.current?.scrollToItem({ item, animated: true });
  }, [selectedDate, lastWeek, thisWeek, nextWeek]);

  useEffect(() => {
    // console.log({ msg: "header version2", selectedDate, activeWeek });
    if (!activeWeek) {
      return;
    }

    if (!isWithinInterval(selectedDate, activeWeek)) {
      if (isBefore(selectedDate, activeWeek.start)) {
        // console.log("before");
        const newDate = addDays(selectedDate, 7);
        setSelectedDate(newDate);
        setJumpToDate(newDate);
      } else {
        // console.log("after");
        const newDate = addDays(selectedDate, -7);
        setSelectedDate(newDate);
        setJumpToDate(newDate);
      }
    }
  }, [activeWeek]);

  const viewableItemsHandler = useDebounceCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        const week = viewableItems[0].item as Interval<Date>;
        setActiveWeek(week);
      }
    },
    100,
  );

  return (
    <>
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-2">
          <Text className="text-xl text-white">
            {format(selectedDate, "MMM yyyy")} &gt;
          </Text>
          <Pressable
            onPress={() => {
              setSelectedDate(today);
              setJumpToDate(today);
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
              setJumpToDate={setJumpToDate}
            />
          )}
          estimatedItemSize={374}
          horizontal
          pagingEnabled
          ref={scrollViewRef}
          showsHorizontalScrollIndicator={false}
          // See: https://stackoverflow.com/questions/45868284/how-to-get-currently-visible-index-in-rn-flat-list
          onViewableItemsChanged={viewableItemsHandler}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        />
      </View>
    </>
  );
};

const Week = ({
  week,
  selectedDate,
  setSelectedDate,
  setJumpToDate,
}: {
  week: Interval;
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  setJumpToDate: Dispatch<SetStateAction<Date | null>>;
}) => {
  const isSelected = (d: Date) => {
    return isSameDay(d, selectedDate);
  };

  return (
    <View className="flex w-screen flex-row">
      {eachDayOfInterval(week).map((d) => (
        <View key={d.getDate()} className="flex flex-1 items-center gap-4">
          <Text className="text-white">{format(d, "E")}</Text>
          <Pressable
            onPress={() => {
              setSelectedDate(d);
              setJumpToDate(d);
            }}
            className={classNames({
              "flex h-10 w-10 items-center justify-center rounded-full bg-red-500":
                isSelected(d),
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
        <Text>PW</Text>
      </Pressable>
    </Link>
  );
};

const Timeline = ({
  timeline,
  headers,
  handleCompleteOrSkip,
  setSelectedDate,
  jumpToDate,
  setJumpToDate,
}: {
  timeline: TimelineEntry[];
  headers: number[];
  handleCompleteOrSkip: (
    activity: ActivityWithPartialRoutine,
    action: "Complete" | "Skip",
  ) => Promise<void>;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  jumpToDate: Date | null;
  setJumpToDate: Dispatch<SetStateAction<Date | null>>;
}) => {
  const agendaScrollViewRef = useRef<FlashList<TimelineEntry>>(null);

  const todayIndex = timeline.findIndex(
    (t) => t.type === "header" && isSameDay(t.date, new Date()),
  );

  const viewableItemsHandler = useDebounceCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        const visibleDate = (viewableItems[0].item as TimelineEntry).date;
        setSelectedDate(visibleDate);
      }
    },
    100,
  );

  useEffect(() => {
    if (jumpToDate) {
      const item = timeline.find(
        (t) => t.type === "header" && isSameDay(t.date, jumpToDate),
      );
      setJumpToDate(null);
      if (item !== undefined) {
        agendaScrollViewRef.current?.scrollToItem({ item, animated: true });
      }
    }
  }, [jumpToDate, setJumpToDate, timeline]);

  return (
    <View className="flex-1">
      <GestureHandlerRootView>
        {todayIndex !== -1 && (
          <FlashList
            data={timeline}
            estimatedItemSize={95}
            initialScrollIndex={todayIndex}
            renderItem={({ item, index }) => (
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
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
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
      <View className="flex h-20 justify-center border-t border-t-white bg-black">
        <Text className="text-2xl font-bold text-white">
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
      <View className="my-2 h-24">
        <TimelineCard
          activity={timelineEntry.activity}
          handleCompleteOrSkip={handleCompleteOrSkip}
        />
      </View>
    );
  } else if (
    (timelineEntry.type === "sunrise" || timelineEntry.type === "sunset") &&
    timelineEntry.sunInfo
  ) {
    return (
      <View className="my-2 h-24">
        <NatureCard nature={timelineEntry.sunInfo} type={timelineEntry.type} />
      </View>
    );
  } else if (timelineEntry.type === "spacer") {
    return <View className="my-2 h-24 bg-black" />;
  } else {
    return (
      <View className="my-2 h-24">
        <Text className="text-2xl font-bold text-red-400">
          Unknown timeline entry type: {timelineEntry.type}
        </Text>
      </View>
    );
  }
};
