import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { Text, View } from "react-native";

import { SunInfo } from "@/stores/sunInfoStore";
import { h_mm_ampm } from "@/utils/date";

export function NatureCard({
  nature,
  type,
}: {
  nature: SunInfo;
  type: "sunrise" | "sunset";
}) {
  return (
    <View className="flex w-full flex-row rounded">
      <View className="flex w-16 items-center justify-center">
        {type === "sunrise" && (
          <Feather name="sunrise" size={42} color="yellow" />
        )}
        {type === "sunset" && (
          <Feather name="sunset" size={42} color="yellow" />
        )}
      </View>
      <View className="flex flex-1 justify-center pl-2">
        <Text className="text-xl text-yellow-300">
          {type === "sunrise" ? "Dawn (first light)" : "Dusk (last light)"}
        </Text>
        <Text className="mb-2 text-yellow-300/80">
          {type === "sunrise"
            ? `Sunrise is at ${format(nature.sunrise, h_mm_ampm)}. Daylight: ${nature.dayLength.hours} hrs ${nature.dayLength.minutes} mins`
            : `Sunset is at ${format(nature.sunset, h_mm_ampm)}. Daylight: ${nature.dayLength.hours} hrs ${nature.dayLength.minutes} mins`}
        </Text>
        <View className="flex flex-row items-center gap-1">
          <Feather name="clock" size={20} color="yellow" />
          <Text className="text-xl text-yellow-300">{`${type === "sunrise" ? format(nature.dawn, h_mm_ampm) : format(nature.dusk, h_mm_ampm)}`}</Text>
        </View>
      </View>
    </View>
  );
}
