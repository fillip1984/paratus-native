import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  addRoutine,
  deleteRoutine,
  findRoutine,
  updateRoutine,
} from "@/stores/routineStore";

export default function RoutineDetails() {
  const params = useLocalSearchParams();
  const id =
    params["id"] === "new" ? undefined : parseInt(params["id"] as string, 10);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("04/03/2024");
  const [endDate, setEndDate] = useState("04/15/2024");
  const [fromTime, setFromTime] = useState("8:00 AM");
  const [toTime, setToTime] = useState("8:45 AM");
  const [repeat, setRepeat] = useState(false);
  const [repeatEnds, setRepeatEnds] = useState(false);
  const [repeatedDays, setRepeatedDays] = useState([
    { label: "Sun", active: false },
    { label: "Mon", active: false },
    { label: "Tue", active: false },
    { label: "Wed", active: false },
    { label: "Thur", active: false },
    { label: "Fri", active: false },
    { label: "Sat", active: false },
  ]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async (id: number) => {
        const result = await findRoutine(id);
        if (result) {
          setName(result.name);
          setDescription(result.description ?? "");
          setRepeat(result.repeat === true);
        }
      };

      if (id) {
        fetchData(id);
      }
    }, [id]),
  );

  const handleSaveRoutine = async () => {
    if (id) {
      const result = await updateRoutine({
        id,
        name,
        description,
        startDate,
        fromTime,
        toTime,
        endDate,
        repeat,
        repeatEnds,
      });
      if (result) {
        router.dismiss();
      }
    } else {
      const result = await addRoutine({
        name,
        description,
        startDate,
        fromTime,
        toTime,
        endDate,
        repeatEnds,
        repeat,
      });
      if (result) {
        router.dismiss();
      }
    }
  };

  const handleDeleteConfirmation = async () => {
    Alert.alert(
      "Are you sure?",
      "This will delete the routine and all related events.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", style: "destructive", onPress: handleDeleteRoutine },
      ],
    );
  };

  const handleDeleteRoutine = async () => {
    if (id) {
      await deleteRoutine(id);
      router.dismiss();
    }
  };

  return (
    <SafeAreaView className="bg-stone-800">
      <View className="flex h-full gap-8 bg-stone-900 px-2">
        <TopActionsBar saveRoutine={handleSaveRoutine} />
        {/* TODO: get react-native-keyboard-accessory to work, it flew across the view and didn't stay where you'd expect it to */}
        {/* <KeyboardAccessoryNavigation
          onNext={() => handleFocus(1)}
          onPrevious={() => handleFocus(-1)}
        /> */}

        <View className="flex flex-1 gap-8">
          <View className="flex gap-2 rounded-lg bg-white p-1">
            <TextInput
              className="px-3 py-2 text-xl"
              value={name}
              onChangeText={(e) => setName(e)}
              placeholder="Name of routine"
            />
            <TextInput
              className="min-h-[100px] border-t border-t-gray-300 px-3 py-2 text-xl"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={(e) => setDescription(e)}
              placeholder="Description of routine"
            />
          </View>

          <View className="flex gap-2 rounded-lg bg-white p-1">
            <View className="flex-row items-center justify-between px-3 py-2">
              <Text className="text-xl">Starts</Text>
              <View className="flex-row gap-2">
                <TextInput
                  className="rounded bg-slate-400/80 p-1 text-xl"
                  value={startDate}
                  onChangeText={(e) => setStartDate(e)}
                />

                <TextInput
                  className="rounded bg-slate-400/80 p-1 text-xl"
                  value={fromTime}
                  onChangeText={(e) => setFromTime(e)}
                />
              </View>
            </View>

            <View className="flex-row items-center justify-between px-3 py-2">
              <Text className="text-xl">Ends</Text>
              <View className="flex-row gap-2">
                <TextInput
                  className="rounded bg-slate-400/80 p-1 text-xl"
                  value={endDate}
                  onChangeText={(e) => setEndDate(e)}
                />

                <TextInput
                  className="rounded bg-slate-400/80 p-1 text-xl"
                  value={fromTime}
                  onChangeText={(e) => setToTime(e)}
                />
              </View>
            </View>
          </View>

          <View className="flex gap-2 rounded-lg bg-white p-1">
            <View className="flex-row items-center justify-between px-3 py-2">
              <Text className="text-xl">Repeat</Text>
              <Switch value={repeat} onChange={() => setRepeat(!repeat)} />
            </View>

            {repeat && (
              <View className="my-2 flex-row justify-center gap-1">
                {repeatedDays.map((day) => (
                  <Pressable
                    key={day.label}
                    onPress={() => {
                      setRepeatedDays((prev) =>
                        prev.map((prevDay) => {
                          if (prevDay.label === day.label) {
                            return { ...day, active: !day.active };
                          } else {
                            return prevDay;
                          }
                        }),
                      );
                    }}
                    className={`${day.active ? "bg-stone-300" : "bg-black"} flex h-14 w-14 items-center justify-center rounded-full`}>
                    <Text
                      className={`${day.active ? "text-black" : "text-white"}`}>
                      {day.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {id && (
          <View>
            <Pressable
              onPress={handleDeleteConfirmation}
              className="flex items-center rounded bg-red-500 p-2">
              <Text className="text-2xl">Delete</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const TopActionsBar = ({ saveRoutine }: { saveRoutine: () => void }) => {
  return (
    <View className="flex-row justify-between">
      <Pressable onPress={() => router.dismiss()}>
        <Text className="text-xl font-bold text-white">Cancel</Text>
      </Pressable>
      <Pressable onPress={saveRoutine}>
        <Text className="text-xl font-bold text-white">Save</Text>
      </Pressable>
    </View>
  );
};
