import { Feather, Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

import { FlexScrollView } from "../_components/ui/FlexScrollView";

import { SelectRoutine, findRoutines } from "@/stores/routineStore";

export default function PlannerScreen() {
  const [routines, setRoutines] = useState<SelectRoutine[]>([]);
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

const RoutineCard = ({ routine }: { routine: SelectRoutine }) => {
  return (
    <Link href={`/(routines)/${routine.id}`} asChild>
      <Pressable className="flex w-full rounded bg-stone-400 p-2">
        <Text className="text-2xl">{routine.name}</Text>
        <Text className="text-small">{routine.description}</Text>
        <View className="my-2">
          <View className="my-2 flex flex-row items-center gap-2">
            <Feather name="repeat" size={24} color="black" />
            <Text className="font-bold text-black">Sun</Text>
            <Text className="font-bold text-black opacity-20">Mon</Text>
            <Text className="font-bold text-black opacity-20">Tue</Text>
            <Text className="font-bold text-black opacity-20">Wed</Text>
            <Text className="font-bold text-black opacity-20">Thurs</Text>
            <Text className="font-bold text-black opacity-20">Fri</Text>
            <Text className="font-bold text-black opacity-20">Sat</Text>
          </View>
          <View className="my-2 flex-row items-center gap-3">
            <Feather name="clock" size={20} color="black" />
            <Text>6:30 - 6:50</Text>
          </View>
          <View className="my-2 flex-row items-center gap-2">
            <Ionicons name="trophy-outline" size={24} color="black" />
            <Text>1/10</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};
