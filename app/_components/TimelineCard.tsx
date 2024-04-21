import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Animated, Text, View, Pressable } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { ActivityWithPartialRoutine } from "@/stores/activityStore";
import { formatHH_mm } from "@/utils/date";

export default function TimelineCard({
  activity,
  handleCompleteOrSkip,
}: {
  activity: ActivityWithPartialRoutine;
  handleCompleteOrSkip: (
    id: number,
    action: "Complete" | "Skip",
  ) => Promise<void>;
}) {
  const handleSwipe = async (
    direction: "left" | "right",
    swipeable: Swipeable,
  ) => {
    switch (direction) {
      case "right":
        // await completeActivity(activity.id);
        await handleCompleteOrSkip(activity.id, "Complete");
        swipeable.close();
        break;
      case "left":
        // currently doing nothing
        break;
    }
  };
  return (
    <Swipeable
      renderLeftActions={(p, d) =>
        LeftActions(p, d, activity, handleCompleteOrSkip)
      }
      renderRightActions={RightActions}
      onSwipeableOpen={(direction, swipeable) =>
        handleSwipe(direction, swipeable)
      }>
      <View className="flex h-24 w-full flex-row rounded bg-stone-300">
        <View className="flex items-center justify-center p-2">
          <FontAwesome5 name="running" size={24} color="black" />
        </View>
        <View
          className={`flex flex-1 justify-center ${activity.complete ? "bg-green-500" : "bg-yellow-200"} pl-2`}>
          <Text className="text-xl text-black">{activity.routine.name}</Text>
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

const LeftActions = (
  progress: Animated.AnimatedInterpolation<string | number>,
  dragX: Animated.AnimatedInterpolation<string | number>,
  activity: ActivityWithPartialRoutine,
  handleCompleteOrSkip: (
    id: number,
    action: "Complete" | "Skip",
  ) => Promise<void>,
) => {
  const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [0, 0.5],
  });

  return (
    <>
      <View className="justify-center bg-red-600">
        <Animated.View
          style={{
            paddingHorizontal: 40,
            transform: [{ scale }],
          }}>
          <Pressable onPress={() => handleCompleteOrSkip(activity.id, "Skip")}>
            <Text className="font-bold text-white">Skip</Text>
          </Pressable>
        </Animated.View>
      </View>
      <View className="justify-center bg-blue-600">
        <Animated.View
          style={{
            paddingHorizontal: 25,
            transform: [{ scale }],
          }}>
          <Link href={`/(routines)/${activity.routineId}`} asChild>
            <Pressable>
              <Text className="font-bold text-white">Routine</Text>
            </Pressable>
          </Link>
        </Animated.View>
      </View>
    </>
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
    <View className="flex-1 items-end justify-center bg-green-600">
      <Animated.Text
        style={{
          color: "white",
          paddingHorizontal: 65,
          fontWeight: "600",
          transform: [{ scale }],
        }}>
        Complete
      </Animated.Text>
    </View>
  );
};
