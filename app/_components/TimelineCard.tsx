import { Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import { Link } from "expo-router";
import { Animated, Pressable, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { ActivityWithPartialRoutine } from "@/stores/activityStore";
import { h_mm_ampm } from "@/utils/date";

export default function TimelineCard({
  activity,
  handleCompleteOrSkip,
}: {
  activity: ActivityWithPartialRoutine;
  handleCompleteOrSkip: (
    activity: ActivityWithPartialRoutine,
    action: "Complete" | "Skip",
  ) => Promise<void>;
}) {
  const handleSwipe = async (
    direction: "left" | "right",
    swipeable: Swipeable,
  ) => {
    switch (direction) {
      case "right":
        await handleCompleteOrSkip(activity, "Complete");
        swipeable.close();
        break;
      case "left":
        // currently doing nothing, there are multiple options that the user can click on
        break;
    }
  };
  return (
    <>
      <Swipeable
        renderLeftActions={(p, d) =>
          LeftActions(p, d, activity, handleCompleteOrSkip)
        }
        renderRightActions={RightActions}
        onSwipeableOpen={(direction, swipeable) =>
          handleSwipe(direction, swipeable)
        }>
        <View className="flex w-full flex-row rounded bg-black">
          <View className="flex w-16 items-center justify-center">
            <Ionicons name="repeat" size={42} color="white" />
          </View>
          <View
            className={`flex flex-1 justify-center ${activity.complete ? "bg-green-600" : activity.skipped ? "bg-red-600" : ""} pl-2`}>
            <Text className="text-xl text-white">{activity.routine.name}</Text>
            <Text className="mb-2 text-white/80">
              {activity.routine.description}
            </Text>
            <View className="mb-2 flex flex-row items-center gap-1">
              <Feather name="clock" size={20} color="white" />
              <Text className="text-xl text-white">
                {`${format(activity.start, h_mm_ampm)} - ${format(activity.end, h_mm_ampm)}`}
              </Text>
            </View>
          </View>
        </View>
      </Swipeable>
    </>
  );
}

const LeftActions = (
  progress: Animated.AnimatedInterpolation<string | number>,
  dragX: Animated.AnimatedInterpolation<string | number>,
  activity: ActivityWithPartialRoutine,
  handleCompleteOrSkip: (
    activity: ActivityWithPartialRoutine,
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
          <Pressable
            onPress={() => {
              handleCompleteOrSkip(activity, "Skip");
            }}>
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
