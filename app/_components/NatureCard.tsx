import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { Text, View } from "react-native";

import { ActivityWithPartialRoutine } from "@/stores/activityStore";
import { h_mm_ampm } from "@/utils/date";

export function NatureCard({ nature }: { nature: ActivityWithPartialRoutine }) {
  return (
    <View className="flex h-28 w-full flex-row rounded bg-stone-300">
      <View className="flex w-16 items-center justify-center p-2">
        {nature.routine.name === "Dawn (first light)" && (
          <Feather name="sunrise" size={42} color="black" />
        )}
        {nature.routine.name === "Dusk (last light)" && (
          <Feather name="sunset" size={42} color="black" />
        )}
      </View>
      <View className="flex flex-1 justify-center bg-yellow-200 pl-2">
        <Text className="text-xl text-black">{nature.routine.name}</Text>
        <Text className="mb-2 text-black/60">{nature.routine.description}</Text>
        <View className="flex flex-row items-center gap-1">
          <Feather name="clock" size={20} color="black" />
          <Text className="text-xl text-black">{`${format(nature.start, h_mm_ampm)}`}</Text>
        </View>
      </View>
    </View>
  );
}
