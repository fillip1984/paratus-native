import { Feather, Ionicons } from "@expo/vector-icons";
import { format, parse } from "date-fns";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

import { FlexScrollView } from "../_components/ui/FlexScrollView";

import {
  RoutineWithScheduledDays,
  createRoutine,
  findRoutines,
} from "@/stores/routineStore";
import { HH_mm_aka24hr, h_mm_ampm } from "@/utils/date";

export default function PlannerScreen() {
  const [routines, setRoutines] = useState<RoutineWithScheduledDays[]>([]);

  const fetchData = async () => {
    const result = await findRoutines();
    setRoutines(result);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const importSampleRoutines = () => {
    const sampleRoutines = [
      {
        name: "Blood pressure reading",
        description: "Take blood pressure reading",
        fromTime: "06:30",
        toTime: "06:50",
        startDate: new Date(),
        repeat: true,
        repeatEnds: false,
        repeatCadence: "Weekly",
        scheduledDays: [
          { label: "Sun", active: false },
          { label: "Mon", active: true },
          { label: "Tue", active: false },
          { label: "Wed", active: false },
          { label: "Thur", active: false },
          { label: "Fri", active: false },
          { label: "Sat", active: false },
        ],
      },
      {
        name: "Take out trash",
        description: "Take out all of the trash and roll cans to the curb",
        fromTime: "17:30",
        toTime: "17:45",
        startDate: new Date(),
        repeat: true,
        repeatEnds: false,
        repeatCadence: "Weekly",
        scheduledDays: [
          { label: "Sun", active: false },
          { label: "Mon", active: false },
          { label: "Tue", active: false },
          { label: "Wed", active: true },
          { label: "Thur", active: false },
          { label: "Fri", active: false },
          { label: "Sat", active: false },
        ],
      },
      {
        name: "Mow the lawn",
        description: "Mow and weed eat the lawn",
        fromTime: "18:00",
        toTime: "19:00",
        startDate: new Date(),
        repeat: true,
        repeatEnds: false,
        repeatCadence: "Weekly",
        scheduledDays: [
          { label: "Sun", active: false },
          { label: "Mon", active: false },
          { label: "Tue", active: false },
          { label: "Wed", active: false },
          { label: "Thur", active: false },
          { label: "Fri", active: true },
          { label: "Sat", active: false },
        ],
      },
      {
        name: "Weigh in",
        description: "Take your weight",
        fromTime: "06:25",
        toTime: "06:30",
        startDate: new Date(),
        repeat: true,
        repeatEnds: false,
        repeatCadence: "Weekly",
        scheduledDays: [
          { label: "Sun", active: false },
          { label: "Mon", active: true },
          { label: "Tue", active: false },
          { label: "Wed", active: false },
          { label: "Thur", active: false },
          { label: "Fri", active: false },
          { label: "Sat", active: false },
        ],
      },
      {
        name: "Unload dishwasher",
        description: "Unload the dishwasher and put away dishes",
        fromTime: "06:00",
        toTime: "06:25",
        startDate: new Date(),
        repeat: true,
        repeatEnds: false,
        repeatCadence: "Weekly",
        scheduledDays: [
          { label: "Sun", active: false },
          { label: "Mon", active: true },
          { label: "Tue", active: true },
          { label: "Wed", active: true },
          { label: "Thur", active: true },
          { label: "Fri", active: true },
          { label: "Sat", active: false },
        ],
      },
      {
        name: "Wash dishes",
        description:
          "Do the dishes including loading the dishwasher, wiping down counters, and washing dishes by hand",
        fromTime: "20:00",
        toTime: "20:25",
        startDate: new Date(),
        repeat: true,
        repeatEnds: false,
        repeatCadence: "Weekly",
        scheduledDays: [
          { label: "Sun", active: false },
          { label: "Mon", active: true },
          { label: "Tue", active: true },
          { label: "Wed", active: true },
          { label: "Thur", active: true },
          { label: "Fri", active: true },
          { label: "Sat", active: false },
        ],
      },
    ] as RoutineWithScheduledDays[];
    sampleRoutines.forEach((routine) => createRoutine(routine));
    fetchData();
  };

  return (
    <SafeAreaView className="bg-black">
      <View className="flex h-screen bg-black px-2">
        <Link href="/(routines)/new" asChild>
          <Text className="mb-2 ml-auto text-2xl font-extrabold text-stone-100">
            Add
          </Text>
        </Link>
        {routines.length === 0 && (
          <View className="flex h-1/2 items-center justify-center gap-2">
            <Text className="text-xl font-bold text-white">
              There are no routines, please add one
            </Text>
            <Pressable
              onPress={importSampleRoutines}
              className="rounded bg-stone-500 px-4 py-2">
              <Text className="text-2xl">Import sample routines</Text>
            </Pressable>
          </View>
        )}
        <FlexScrollView>
          {routines.map((routine) => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
        </FlexScrollView>
      </View>
    </SafeAreaView>
  );
}

const RoutineCard = ({ routine }: { routine: RoutineWithScheduledDays }) => {
  return (
    <Link href={`/(routines)/${routine.id}`} asChild>
      <Pressable className="flex w-full rounded bg-stone-400 p-2">
        <Text className="text-2xl">{routine.name}</Text>
        <Text className="text-small">{routine.description}</Text>
        <View className="my-2">
          <View className="my-2 flex-row items-center gap-3">
            <Feather name="clock" size={20} color="black" />
            <Text>
              {`${format(
                parse(routine.fromTime, HH_mm_aka24hr, new Date()),
                h_mm_ampm,
              )} - ${format(
                parse(routine.toTime, HH_mm_aka24hr, new Date()),
                h_mm_ampm,
              )}`}
            </Text>
          </View>
          {routine.repeat && (
            <View className="my-2 flex flex-row items-center gap-2">
              <Feather name="repeat" size={24} color="black" />
              {routine.repeatCadence === "Daily" && <Text>Daily</Text>}
              {routine.repeatCadence === "Weekly" && (
                <View className="flex flex-row gap-2">
                  <Text>Weekly:</Text>
                  {routine.scheduledDays.map((scheduledDay) => (
                    <Text
                      key={scheduledDay.label}
                      className={`text-black ${scheduledDay.active ? "" : "opacity-20"}`}>
                      {scheduledDay.label}
                    </Text>
                  ))}
                </View>
              )}
              {routine.repeatCadence === "Monthly" && (
                <View className="mr-10 flex-row flex-wrap">
                  <Text>Monthly: </Text>
                  {routine.scheduledDays.map((scheduledDay) => (
                    <Text
                      key={scheduledDay.label}
                      className={`text-black ${scheduledDay.active ? "" : "opacity-20"}`}>
                      {scheduledDay.label},{" "}
                    </Text>
                  ))}
                </View>
              )}
              {routine.repeatCadence === "Yearly" && (
                <View className="mr-10 flex-row flex-wrap">
                  <Text>Yearly: </Text>
                  {routine.scheduledDays.map((scheduledDay) => (
                    <Text
                      key={scheduledDay.label}
                      className={`text-black ${scheduledDay.active ? "" : "opacity-20"}`}>
                      {scheduledDay.label}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
          <View className="my-2 flex-row items-center gap-2">
            <Ionicons name="trophy-outline" size={24} color="black" />
            <Text>1/10</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};
