import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
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
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { NatureCard } from "../_components/NatureCard";
import TimelineCard from "../_components/TimelineCard";

import { ActivityFilterType } from "@/db/schema";
import { scheduleNotificationForActivity } from "@/notifications";
import {
  ActivityWithPartialRoutine,
  completeActivity,
  findActivities,
  skipActivity,
} from "@/stores/activityStore";
import fetchSunInfo from "@/stores/sunriseStore";
import { h_mm_ampm, yyyyMMddHyphenated } from "@/utils/date";

interface TimelineEntry {
  type: "sunrise" | "sunset" | "nature" | "todo" | "activity" | "header";
  date: Date;
  activity: ActivityWithPartialRoutine;
}

export default function Home() {
  const today = new Date();
  const sunday = startOfWeek(today);
  const saturday = endOfWeek(today);
  const thisWeek = interval(sunday, saturday);
  const lastWeek = interval(addWeeks(sunday, -1), addWeeks(saturday, -1));
  const nextWeek = interval(addWeeks(sunday, 1), addWeeks(saturday, 1));

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [headers, setHeaders] = useState<number[]>([]);

  // const [activities, setActivities] = useState<ActivityWithPartialRoutine[]>(
  //   [],
  // );
  // const [natureActivities, setNatureActivities] = useState<
  //   ActivityWithPartialRoutine[]
  // >([]);

  // TODO: move up to layout and application init
  const fetchSunriseInfo = async (date: Date) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    let sunriseInfo = null;
    if (status === "granted") {
      try {
        const location = await Location.getLastKnownPositionAsync();
        if (location) {
          sunriseInfo = await fetchSunInfo(
            date,
            location.coords.latitude,
            location.coords.longitude,
          );
          if (sunriseInfo) {
            const sunriseActivity = {
              routine: {
                name: "Dawn (first light)",
                description: `Sunrise is at ${format(sunriseInfo.sunrise, h_mm_ampm)}. Daylight: ${sunriseInfo.dayLength.hours} hrs ${sunriseInfo.dayLength.minutes} mins`,
              },
              start: sunriseInfo.dawn,
              end: sunriseInfo.dawn,
              id: -998,
            } as ActivityWithPartialRoutine;
            // setNatureActivities([sunriseActivity]);

            const sunsetActivity = {
              routine: {
                name: "Dusk (last light)",
                description: `Sunset is at ${format(sunriseInfo.sunset, h_mm_ampm)}. Daylight: ${sunriseInfo.dayLength.hours} hrs ${sunriseInfo.dayLength.minutes} mins`,
              },
              start: sunriseInfo.dusk,
              end: sunriseInfo.dusk,
              id: -999,
            } as ActivityWithPartialRoutine;
            // setNatureActivities((prev) => [...prev, sunsetActivity]);
          }
        } else {
          return undefined;
        }
      } catch (err) {
        console.warn(
          "Purposefully ignoring unresolved promises and errors while fetching sunrise info so the rest of activities are shown",
          err,
        );
      }
    }
  };

  const fetchData = async () => {
    const result = await findActivities({
      start: startOfDay(lastWeek.start),
      end: endOfDay(nextWeek.end),
    });

    const newTimeline = [] as TimelineEntry[];
    eachDayOfInterval({ start: lastWeek.start, end: nextWeek.end }).map((d) => {
      newTimeline.push({ type: "header", date: d } as TimelineEntry);
      result
        .filter((r) => isSameDay(r.start, d))
        .forEach((r) =>
          newTimeline.push({
            type: "activity",
            date: d,
            activity: r,
          } as TimelineEntry),
        );
    });
    setTimeline(newTimeline);
    setHeaders(
      newTimeline
        .map((t, i) => (t.type === "header" ? i : -1))
        .filter((t) => t !== -1),
    );
  };

  // useEffect(() => {
  //   const scheduleStuff = async () => {
  //     if (activities?.length > 0) {
  //       const notifications =
  //         await Notifications.getAllScheduledNotificationsAsync();
  //       activities.forEach((act) => {
  //         const cancel = notifications.filter(
  //           (n) => n.content.data.activityId === act.id,
  //         );
  //         cancel.forEach((c) =>
  //           Notifications.cancelScheduledNotificationAsync(c.identifier),
  //         );
  //         if (act.routine) {
  //           scheduleNotificationForActivity(act);
  //         }
  //       });
  //     }
  //   };
  //   scheduleStuff();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      // fetchSunriseInfo();
    }, []),
  );

  // useEffect(() => {
  //   fetchActivities();
  // }, [selectedDate]);

  const handleCompleteOrSkip = async (
    activity: ActivityWithPartialRoutine,
    action: "Complete" | "Skip",
  ) => {
    // switch (action) {
    //   case "Complete":
    //     handleComplete(activity);
    //     fetchActivities();
    //     Promise.resolve();
    //     break;
    //   case "Skip":
    //     await skipActivity(activity.id);
    //     fetchActivities();
    //     Promise.resolve();
    //     break;
    //   default:
    //     Promise.reject(
    //       Error(
    //         "Unexpected action, was expecting Complete or Skip only, received: " +
    //           action +
    //           " on activity: " +
    //           activity.routine.name,
    //       ),
    //     );
    // }
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
          lastWeek={lastWeek}
          thisWeek={thisWeek}
          nextWeek={nextWeek}
          today={today}
        />
        <Timeline
          timeline={timeline}
          headers={headers}
          handleCompleteOrSkip={handleCompleteOrSkip}
        />
      </View>
    </SafeAreaView>
  );
}

const Header = ({
  selectedDate,
  setSelectedDate,
  lastWeek,
  thisWeek,
  nextWeek,
  today,
}: {
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  lastWeek: Interval;
  thisWeek: Interval;
  nextWeek: Interval;
  today: Date;
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [coordinates, setCoordinates] = useState(0);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({
      x: coordinates,
      y: 0,
    });
  }, [coordinates]);

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
              console.log(coordinates);
              scrollViewRef.current?.scrollTo({
                x: coordinates,
                y: 0,
                animated: true,
              });
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
      <ScrollView
        ref={scrollViewRef}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}>
        <View className="flex flex-row flex-nowrap overflow-hidden">
          <Week
            week={lastWeek}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <View
            onLayout={(e) => {
              const layout = e.nativeEvent.layout;
              setCoordinates(layout.x);
            }}>
            <Week
              week={thisWeek}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </View>
          <Week
            week={nextWeek}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const Week = ({
  week,
  selectedDate,
  setSelectedDate,
}: {
  week: Interval;
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
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
            onPress={() => setSelectedDate(d)}
            className={classNames({
              "flex h-10 w-10 items-center justify-center rounded-full bg-red-500":
                isSameDay(selectedDate, d),
              // "flex h-10 w-10 items-center justify-center": isToday(d),
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
}: {
  timeline: TimelineEntry[];
  headers: number[];
  handleCompleteOrSkip: (
    activity: ActivityWithPartialRoutine,
    action: "Complete" | "Skip",
  ) => Promise<void>;
}) => {
  return (
    <View className="flex-1">
      <GestureHandlerRootView>
        <ScrollView stickyHeaderIndices={headers}>
          {timeline.map((timelineEntry) => {
            if (timelineEntry.type === "header") {
              return (
                <View
                  key={timelineEntry.date.toISOString() + timelineEntry.type}
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
            } else if (timelineEntry.type === "activity") {
              return (
                <TimelineCard
                  key={timelineEntry.activity.id}
                  activity={timelineEntry.activity}
                  handleCompleteOrSkip={handleCompleteOrSkip}
                />
              );
            }
          })}
          {/* {natureActivities.length > 0 && (
            <NatureCard nature={natureActivities[0]} />
          )}
          {activities.map((activity) => (
            <TimelineCard
              key={activity.id}
              activity={activity}
              handleCompleteOrSkip={handleCompleteOrSkip}
            />
          ))}
          {natureActivities.slice(1).map((nature) => (
            <NatureCard key={nature.id} nature={nature} />
          ))}
          {activities.length === 0 && (
            <Text className="my-8 text-center text-3xl text-white">
              No activities
            </Text>
          )} */}
        </ScrollView>
      </GestureHandlerRootView>
    </View>
  );
};
