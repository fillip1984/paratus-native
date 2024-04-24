import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, SafeAreaView, Text, View } from "react-native";

import { createActivitiesFromRoutine } from "@/stores/activityStore";
import { deleteRoutine, findRoutines } from "@/stores/routineStore";

export default function Preferences() {
  const [rebuilding, setRebuilding] = useState(false);

  const confirmRebuild = () => {
    Alert.alert(
      "Are you sure?",
      "This will delete activities and their outcomes and rebuild them.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: rebuildActivities,
        },
      ],
    );
  };

  const rebuildActivities = async () => {
    console.log("rebuilding");
    // TODO: work on reactivity, the rebuilding flag isn't getting rendered. Would be nice to get a check mark once it happens that remains for a few seconds
    setRebuilding(true);
    const routines = await findRoutines();
    for (const routine of routines) {
      await createActivitiesFromRoutine(routine.id);
    }
    setRebuilding(false);
    router.dismiss();
  };

  const confirmDelete = () => {
    Alert.alert(
      "Are you sure?",
      "This will delete all routines, this cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: deleteRoutines,
        },
      ],
    );
  };

  // TODO: should we allow this to go to production?
  const deleteRoutines = async () => {
    const routines = await findRoutines();
    for (const routine of routines) {
      await deleteRoutine(routine.id);
    }
    router.dismiss();
  };

  return (
    <SafeAreaView className="bg-stone-800">
      <View className="h-full p-2">
        <Text className="text-xl text-white">
          Rebuilding activities will recreate all activities for all routines.
        </Text>
        <Text className="font-bold uppercase text-white">
          All activity history will be lost!
        </Text>
        <Pressable
          onPress={confirmRebuild}
          className="m-2 flex-row items-center justify-center gap-4 rounded bg-red-600 p-2">
          <Text className="text-2xl">Rebuild Activities</Text>
          {rebuilding && (
            <View className="animate-spin">
              <FontAwesome6 name="circle-notch" size={24} color="black" />
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={confirmDelete}
          className="m-2 rounded border border-red-600 p-2">
          <Text className="text-center text-2xl text-red-600">
            Delete all routines
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
