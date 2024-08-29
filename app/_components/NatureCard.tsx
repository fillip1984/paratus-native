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
    <View className="my-2 flex h-28 w-full flex-row rounded bg-stone-300">
      <View className="flex w-16 items-center justify-center p-2">
        {type === "sunrise" && (
          <Feather name="sunrise" size={42} color="black" />
        )}
        {type === "sunset" && <Feather name="sunset" size={42} color="black" />}
      </View>
      <View className="flex flex-1 justify-center bg-yellow-200 pl-2">
        <Text className="text-xl text-black">
          {type === "sunrise" ? "Dawn (first light)" : "Dusk (last light)"}
        </Text>
        <Text className="mb-2 text-black/60">
          {type === "sunrise"
            ? `Sunrise is at ${format(nature.sunrise, h_mm_ampm)}. Daylight: ${nature.dayLength.hours} hrs ${nature.dayLength.minutes} mins`
            : `Sunset is at ${format(nature.sunset, h_mm_ampm)}. Daylight: ${nature.dayLength.hours} hrs ${nature.dayLength.minutes} mins`}
        </Text>
        <View className="flex flex-row items-center gap-1">
          <Feather name="clock" size={20} color="black" />
          <Text className="text-xl text-black">{`${type === "sunrise" ? format(nature.dawn, h_mm_ampm) : format(nature.dusk, h_mm_ampm)}`}</Text>
        </View>
      </View>
    </View>
  );
}
