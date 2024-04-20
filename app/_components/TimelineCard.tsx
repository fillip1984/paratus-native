import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { View, Animated, Text } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { SelectActivity } from "@/db/schema";
import { formatHH_mm } from "@/utils/date";

export default function TimelineCard({
  activity,
}: {
  activity: SelectActivity;
}) {
  return (
    <Swipeable
      renderLeftActions={LeftActions}
      renderRightActions={RightActions}
      onSwipeableOpen={(direction) => console.log(`open ${direction}`)}>
      <View className="flex h-24 w-full flex-row rounded bg-stone-300">
        <View className="flex items-center justify-center p-2">
          <FontAwesome5 name="running" size={24} color="black" />
        </View>
        <View className="flex flex-1 justify-center bg-yellow-200 pl-2">
          <Text className="text-xl text-black">{activity.name}</Text>
          <View className="flex flex-row items-center gap-1">
            <Feather name="clock" size={20} color="black" />
            <Text className="text-xl text-black">
              {formatHH_mm(activity.start)}-{formatHH_mm(activity.end)}
            </Text>
          </View>
        </View>
      </View>
    </Swipeable>
  );
}

const LeftActions = () => {
  return (
    <View
      style={{ flex: 1, backgroundColor: "blue", justifyContent: "center" }}>
      <Text
        style={{
          color: "white",
          paddingHorizontal: 10,
          fontWeight: "600",
        }}>
        Skip
      </Text>
    </View>
  );
};

const RightActions = (
  progress: Animated.AnimatedInterpolation<string | number>,
  dragX: Animated.AnimatedInterpolation<string | number>,
) => {
  const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [0.7, 0],
  });

  return (
    <>
      <View style={{ backgroundColor: "red", justifyContent: "center" }}>
        <Animated.Text
          style={{
            color: "white",
            paddingHorizontal: 10,
            fontWeight: "600",
            transform: [{ scale }],
          }}>
          Delete
        </Animated.Text>
      </View>
      <View style={{ backgroundColor: "green", justifyContent: "center" }}>
        <Animated.Text
          style={{
            color: "white",
            paddingHorizontal: 10,
            fontWeight: "600",
            transform: [{ scale }],
          }}>
          Archive
        </Animated.Text>
      </View>
    </>
  );
};
