import { Feather, Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

import { FlexScrollView } from "../_components/ui/FlexScrollView";

import { RoutineWithScheduledDays } from "@/db/schema";
import { findRoutines } from "@/stores/routineStore";
import { parseHH_mm } from "@/utils/date";

export default function PlannerScreen() {
  const [routines, setRoutines] = useState<RoutineWithScheduledDays[]>([]);
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const result = await findRoutines();
        setRoutines(result);
      };
      fetchData();
    }, []),
  );

  return (
    <SafeAreaView className="bg-black">
      <View className="flex h-screen bg-black px-2">
        <Link href="/(routines)/new" asChild>
          <Text className="mb-2 ml-auto text-2xl font-extrabold text-stone-100">
            Add
          </Text>
        </Link>
        {routines.length === 0 && (
          <View className="flex h-1/2 items-center justify-center">
            <Text className="text-xl font-bold text-white">
              There are no routines, please add one
            </Text>
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
              {routine.fromTime} {routine.toTime ? `- ${routine.toTime}` : ""}
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
