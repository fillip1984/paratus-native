import RNDateTimePicker from "@react-native-community/datetimepicker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SelectScheduledDay,
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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [repeat, setRepeat] = useState(false);
  const [repeatEnds, setRepeatEnds] = useState(false);
  const [scheduledDays, setscheduledDays] = useState<SelectScheduledDay[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async (id: number) => {
        const result = await findRoutine(id);
        if (result) {
          setName(result.name);
          setDescription(result.description ?? "");
          setStartDate(new Date(result.startDate));
          setEndDate(result.endDate ? new Date(result.endDate) : new Date());
          setFromTime(new Date(result.fromTime));
          setToTime(new Date(result.toTime));
          setRepeat(result.repeat === true);

          if (result.scheduledDays.length > 0) {
            setscheduledDays(result.scheduledDays);
          } else {
            setscheduledDays([
              {
                id: -1,
                label: "Sun",
                active: false,
                routineId: id ?? -1,
              },
              { id: -1, label: "Mon", active: false, routineId: id ?? -1 },
              { id: -1, label: "Tue", active: false, routineId: id ?? -1 },
              { id: -1, label: "Wed", active: false, routineId: id ?? -1 },
              { id: -1, label: "Thur", active: false, routineId: id ?? -1 },
              { id: -1, label: "Fri", active: false, routineId: id ?? -1 },
              { id: -1, label: "Sat", active: false, routineId: id ?? -1 },
            ]);
          }
        }
      };

      if (id) {
        fetchData(id);
      } else {
        setscheduledDays([
          {
            id: -1,
            label: "Sun",
            active: false,
            routineId: id ?? -1,
          },
          { id: -1, label: "Mon", active: false, routineId: id ?? -1 },
          { id: -1, label: "Tue", active: false, routineId: id ?? -1 },
          { id: -1, label: "Wed", active: false, routineId: id ?? -1 },
          { id: -1, label: "Thur", active: false, routineId: id ?? -1 },
          { id: -1, label: "Fri", active: false, routineId: id ?? -1 },
          { id: -1, label: "Sat", active: false, routineId: id ?? -1 },
        ]);
      }
    }, [id]),
  );

  const handleSaveRoutine = async () => {
    if (id) {
      const result = await updateRoutine({
        id,
        name,
        description,
        startDate: startDate.toString(),
        fromTime: fromTime.toString(),
        toTime: toTime?.toString() ?? "",
        endDate: repeat ? endDate.toString() : null,
        repeat,
        repeatEnds,
        scheduledDays: repeat ? scheduledDays : [],
      });
      if (result) {
        router.dismiss();
      }
    } else {
      const result = await addRoutine({
        id: -1,
        name,
        description,
        startDate: startDate.toString(),
        fromTime: fromTime.toString(),
        toTime: toTime?.toString() ?? "",
        endDate: repeat ? endDate.toString() : null,
        repeat,
        repeatEnds,
        scheduledDays: repeat ? scheduledDays : [],
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
        <ScrollView>
          <View className="flex flex-1 gap-8">
            <View className="flex gap-2 rounded-lg bg-stone-800 p-1">
              <TextInput
                className="px-3 py-2 text-xl text-white placeholder:text-stone-500"
                value={name}
                onChangeText={(e) => setName(e)}
                placeholder="Name of routine"
              />
              <TextInput
                className="min-h-[100px] border-t border-t-stone-700 px-3 py-2 text-xl text-white placeholder:text-stone-500"
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={(e) => setDescription(e)}
                placeholder="Description of routine"
              />
            </View>

            <View className="flex gap-2 rounded-lg bg-stone-800 p-1">
              <View className="flex-row items-center justify-between px-3 py-2">
                <Text className="text-xl font-semibold text-white">From</Text>
                <RNDateTimePicker
                  value={fromTime}
                  onChange={(_e, d) => {
                    if (d) setFromTime(d);
                  }}
                  mode="time"
                  themeVariant="dark"
                  accentColor="white"
                />
              </View>
              <View className="flex-row items-center justify-between px-3 py-2">
                <Text className="text-xl font-semibold text-white">To</Text>
                <RNDateTimePicker
                  value={toTime}
                  onChange={(_, d) => {
                    if (d) setToTime(d);
                  }}
                  mode="time"
                  themeVariant="dark"
                  accentColor="white"
                />
              </View>
            </View>

            <View className="flex gap-2 rounded-lg bg-stone-800 p-1">
              <View className="flex-row items-center justify-between px-3 py-2">
                <Text className="text-xl font-semibold text-white">
                  {repeat ? "Starts" : "On"}
                </Text>
                <RNDateTimePicker
                  value={startDate}
                  onChange={(_, d) => {
                    if (d) setStartDate(d);
                  }}
                  mode="date"
                  themeVariant="dark"
                  accentColor="white"
                />
              </View>

              <View className="flex-row items-center justify-between px-3 py-2">
                <Text className="text-xl font-semibold text-white">Repeat</Text>
                <Switch value={repeat} onChange={() => setRepeat(!repeat)} />
              </View>

              {repeat && (
                <>
                  {/* <PickerIOS themeVariant="dark">
                    <Picker.Item label="Daily" value="daily" />
                    <Picker.Item label="Weekly" value="weekly" />
                    <Picker.Item label="Monthly" value="monthly" />
                    <Picker.Item label="Yearly" value="yearly" />
                  </PickerIOS> */}

                  {/* <RNPickerSelect
                    darkTheme
                    onValueChange={(value) => console.log(value)}
                    items={[
                      { label: "JavaScript", value: "JavaScript" },
                      { label: "TypeScript", value: "TypeScript" },
                      { label: "Python", value: "Python" },
                      { label: "Java", value: "Java" },
                      { label: "C++", value: "C++" },
                      { label: "C", value: "C" },
                    ]}
                  /> */}
                  <View className="flex-row items-center justify-between px-3 py-2">
                    <Text className="text-xl font-semibold text-white">
                      Ends
                    </Text>
                    <RNDateTimePicker
                      value={endDate ?? new Date()}
                      onChange={(_, d) => {
                        if (d) setEndDate(d);
                      }}
                      mode="date"
                      themeVariant="dark"
                      accentColor="white"
                    />
                  </View>
                  <View className="my-2 flex-row justify-center gap-3">
                    {scheduledDays.map((day) => (
                      <Pressable
                        key={day.label}
                        onPress={() => {
                          setscheduledDays((prev) =>
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
                </>
              )}
            </View>
          </View>
        </ScrollView>

        {id && (
          <View className="mb-2">
            <Pressable
              onPress={handleDeleteConfirmation}
              className="flex items-center rounded border border-red-500 p-2">
              <Text className="text-2xl text-red-500">Delete</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const TopActionsBar = ({ saveRoutine }: { saveRoutine: () => void }) => {
  return (
    <View className="mx-2 mt-3 flex-row justify-between">
      <Pressable onPress={() => router.dismiss()}>
        <Text className="text-xl font-bold text-white">Cancel</Text>
      </Pressable>
      <Pressable onPress={saveRoutine}>
        <Text className="text-xl font-bold text-white">Save</Text>
      </Pressable>
    </View>
  );
};
