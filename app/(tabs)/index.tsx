import { Feather } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { addDays, format, isToday, isTomorrow, isYesterday } from "date-fns";
import * as Location from "expo-location";
import { Link, router, useFocusEffect } from "expo-router";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

import { NatureCard } from "../_components/NatureCard";
import TimelineCard from "../_components/TimelineCard";
import { FlexScrollView } from "../_components/ui/FlexScrollView";

import { ActivityFilterType } from "@/db/schema";
import {
  ActivityWithPartialRoutine,
  completeActivity,
  findActivities,
  skipActivity,
} from "@/stores/activityStore";
import fetchSunInfo from "@/stores/sunriseStore";
import { h_mm_ampm } from "@/utils/date";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<ActivityFilterType>("Available");
  const [activities, setActivities] = useState<ActivityWithPartialRoutine[]>(
    [],
  );
  const [natureActivities, setNatureActivities] = useState<
    ActivityWithPartialRoutine[]
  >([]);

  // TODO: move up to layout and application init
  const fetchSunriseInfo = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    let sunriseInfo = null;
    if (status === "granted") {
      try {
        // console.log({ status });
        const location = await Location.getLastKnownPositionAsync();
        if (location) {
          sunriseInfo = await fetchSunInfo(
            selectedDate,
            location.coords.latitude,
            location.coords.longitude,
          );
          console.log({ sunriseInfo });
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
            setNatureActivities([sunriseActivity]);

            const sunsetActivity = {
              routine: {
                name: "Dusk (last light)",
                description: `Sunset is at ${format(sunriseInfo.sunset, h_mm_ampm)}. Daylight: ${sunriseInfo.dayLength.hours} hrs ${sunriseInfo.dayLength.minutes} mins`,
              },
              start: sunriseInfo.dusk,
              end: sunriseInfo.dusk,
              id: -999,
            } as ActivityWithPartialRoutine;
            setNatureActivities((prev) => [...prev, sunsetActivity]);
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

  const fetchActivities = async () => {
    const result = await findActivities({
      date: selectedDate,
      filter,
    });
    setActivities(result);
  };

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
      fetchSunriseInfo();
    }, [selectedDate, filter]),
  );

  useEffect(() => {
    fetchActivities();
  }, [selectedDate, filter]);

  const handleCompleteOrSkip = async (
    activity: ActivityWithPartialRoutine,
    action: "Complete" | "Skip",
  ) => {
    console.log({ msg: "Handling complete/skip", action });
    switch (action) {
      case "Complete":
        handleComplete(activity);
        fetchActivities();
        Promise.resolve();
        break;
      case "Skip":
        await skipActivity(activity.id);
        fetchActivities();
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
      <View className="h-screen">
        <Header
          activities={activities}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <TimelineFilter filter={filter} setFilter={setFilter} />
        <Timeline
          activities={activities}
          natureActivities={natureActivities}
          handleCompleteOrSkip={handleCompleteOrSkip}
        />
      </View>
    </SafeAreaView>
  );
}

const Header = ({
  activities,
  selectedDate,
  setSelectedDate,
}: {
  activities: ActivityWithPartialRoutine[];
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
}) => {
  const formatForDayLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isYesterday(selectedDate)) return "Yesterday";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    return format(selectedDate, "EEEE");
  };
  return (
    <View className="relative items-center">
      <Text className="text-2xl text-white">
        {activities.length}{" "}
        <Text className="text-white/50">activities for</Text>{" "}
        {formatForDayLabel()}
      </Text>
      <View className="flex-row items-center justify-around">
        <Pressable onPress={() => setSelectedDate((prev) => addDays(prev, -1))}>
          <Feather name="chevron-left" size={36} color="white" />
        </Pressable>
        {/* TODO: figure out how to push this center */}
        <RNDateTimePicker
          value={selectedDate}
          onChange={(_, d) => {
            if (d) setSelectedDate(d);
          }}
          mode="date"
          themeVariant="dark"
          accentColor="white"
        />
        <Pressable onPress={() => setSelectedDate((prev) => addDays(prev, 1))}>
          <Feather name="chevron-right" size={36} color="white" />
        </Pressable>
      </View>
      <Avatar />
    </View>
  );
};

const Avatar = () => {
  return (
    <Link href="/(modals)/preferences" asChild>
      <Pressable className="absolute right-0 top-0 flex h-14 w-14 items-center justify-center rounded-full bg-stone-400">
        <Text>PH</Text>
      </Pressable>
    </Link>
  );
};

const TimelineFilter = ({
  filter,
  setFilter,
}: {
  filter: ActivityFilterType;
  setFilter: Dispatch<SetStateAction<ActivityFilterType>>;
}) => {
  return (
    <Pressable className="flex flex-row px-2 py-4">
      <Pressable
        onPress={() => setFilter("Available")}
        className={`w-1/4 items-center rounded-l-lg p-4 ${filter === "Available" ? "bg-stone-200" : "bg-stone-500"}`}>
        <Text>Available</Text>
      </Pressable>
      <Pressable
        onPress={() => setFilter("Complete")}
        className={`w-1/4 items-center p-4 ${filter === "Complete" ? "bg-stone-200" : "bg-stone-500"}`}>
        <Text>Complete</Text>
      </Pressable>
      <Pressable
        onPress={() => setFilter("Skipped")}
        className={`w-1/4 items-center p-4 ${filter === "Skipped" ? "bg-stone-200" : "bg-stone-500"}`}>
        <Text>Skipped</Text>
      </Pressable>
      <Pressable
        onPress={() => setFilter("All")}
        className={`w-1/4 items-center rounded-r-lg p-4 ${filter === "All" ? "bg-stone-200" : "bg-stone-500"}`}>
        <Text>All</Text>
      </Pressable>
    </Pressable>
  );
};

const Timeline = ({
  activities,
  natureActivities,
  handleCompleteOrSkip,
}: {
  activities: ActivityWithPartialRoutine[];
  natureActivities: ActivityWithPartialRoutine[];
  handleCompleteOrSkip: (
    activity: ActivityWithPartialRoutine,
    action: "Complete" | "Skip",
  ) => Promise<void>;
}) => {
  return (
    <View className="flex-1">
      <FlexScrollView>
        {natureActivities.length > 0 && (
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
        )}
      </FlexScrollView>
    </View>
  );
};
