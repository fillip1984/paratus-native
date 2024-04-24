import RNDateTimePicker from "@react-native-community/datetimepicker";
import { endOfDay, format, parse, startOfDay } from "date-fns";
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

import { RepeatCadenceType, SelectScheduledDay } from "@/db/schema";
import { createActivitiesFromRoutine } from "@/stores/activityStore";
import {
  createRoutine,
  deleteRoutine,
  findRoutine,
  updateRoutine,
} from "@/stores/routineStore";
import { HH_mm_aka24hr, MMddSlash } from "@/utils/date";

export default function RoutineDetails() {
  const params = useLocalSearchParams();
  const id =
    params["id"] === "new" ? undefined : parseInt(params["id"] as string, 10);
  const isNew = id === undefined;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfDay(new Date()));
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [repeat, setRepeat] = useState(false);
  const [repeatEnds, setRepeatEnds] = useState(false);
  const [repeatCadence, setRepeatCadence] =
    useState<RepeatCadenceType>("Daily");
  const [scheduledDays, setScheduledDays] = useState<SelectScheduledDay[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async (id: number) => {
        const result = await findRoutine(id);
        if (result) {
          setName(result.name);
          setDescription(result.description ?? "");
          setStartDate(new Date(result.startDate));
          setFromTime(parse(result.fromTime, HH_mm_aka24hr, new Date()));
          setToTime(parse(result.toTime, HH_mm_aka24hr, new Date()));
          setEndDate(result.endDate ? new Date(result.endDate) : new Date());
          setRepeat(result.repeat === true);
          setRepeatEnds(result.repeatEnds === true);
          setRepeatCadence(result.repeatCadence);
          setScheduledDays(result.scheduledDays);
        }
      };

      if (!isNew) {
        fetchData(id);
      }
    }, [id, isNew]),
  );

  const buildScheduledDays = (v: string) => {
    switch (v) {
      case "Daily":
        setScheduledDays([]);
        break;
      case "Weekly":
        setScheduledDays(buildWeeklyScheduledDays());
        break;
      case "Monthly":
        setScheduledDays(buildMonthlyScheduledDays());
        break;
      case "Yearly":
        buildYearlyScheduledDays(new Date());
        break;
      default:
        throw Error("Unknown repeat cadence: " + repeatCadence);
    }
    setRepeatCadence(v);
  };

  const buildWeeklyScheduledDays = () => {
    return [
      { id: -1, label: "Sun", active: false, routineId: -1 },
      { id: -1, label: "Mon", active: false, routineId: -1 },
      { id: -1, label: "Tue", active: false, routineId: -1 },
      { id: -1, label: "Wed", active: false, routineId: -1 },
      { id: -1, label: "Thur", active: false, routineId: -1 },
      { id: -1, label: "Fri", active: false, routineId: -1 },
      { id: -1, label: "Sat", active: false, routineId: -1 },
    ];
  };

  const buildMonthlyScheduledDays = () => {
    return Array.from(Array(31).keys()).map((d) => {
      return {
        label: (d + 1).toString(),
        active: false,
      } as SelectScheduledDay;
    });
  };

  const buildYearlyScheduledDays = (d: Date) => {
    return [
      {
        id: -1,
        label: format(d, MMddSlash),
        active: true,
        routineId: -1,
      } as SelectScheduledDay,
    ];
  };

  const handleSaveRoutine = async () => {
    if (!isNew) {
      const result = await updateRoutine({
        id,
        name,
        description,
        startDate,
        fromTime: format(fromTime, HH_mm_aka24hr),
        toTime: format(toTime, HH_mm_aka24hr),
        endDate: repeatEnds ? endDate : null,
        repeat,
        repeatEnds,
        repeatCadence,
        scheduledDays: repeat ? scheduledDays : [],
      });
      if (result) {
        router.dismiss();
      }
    } else {
      const result = await createRoutine({
        id: -1,
        name,
        description,
        startDate,
        fromTime: format(fromTime, HH_mm_aka24hr),
        toTime: format(toTime, HH_mm_aka24hr),
        endDate: repeatEnds ? endDate : null,
        repeat,
        repeatEnds,
        repeatCadence,
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

  /**
   * Parses Date in MM/dd format and if not given a valid string in that format returns today
   *
   */
  const parseDateOrToday = (str: string) => {
    // TODO: probably a better way to do this
    if (!str) {
      return new Date();
    }

    const d = parse(str, "MM/dd", new Date());
    if (isNaN(d.getDate())) {
      return new Date();
    }

    return d;
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
                    if (d) setStartDate(startOfDay(d));
                  }}
                  mode="date"
                  themeVariant="dark"
                  accentColor="white"
                />
              </View>

              <View className="flex-row items-center justify-between px-3 py-2">
                <Text className="text-xl font-semibold text-white">Repeat</Text>
                <Switch
                  value={repeat}
                  onChange={() => setRepeat((prev) => !prev)}
                />
              </View>

              {repeat && (
                <>
                  <View className="flex-row items-center justify-between px-3 py-2">
                    <Text className="text-xl font-semibold text-white">
                      Ends
                    </Text>

                    <Switch
                      value={repeatEnds}
                      onChange={() => setRepeatEnds((prev) => !prev)}
                    />
                  </View>

                  {repeatEnds && (
                    <View className="flex-row items-center justify-between px-3 py-2">
                      <Text className="text-xl font-semibold text-white">
                        Ends On
                      </Text>

                      <RNDateTimePicker
                        value={endDate ?? new Date()}
                        onChange={(_, d) => {
                          if (d) setEndDate(endOfDay(d));
                        }}
                        mode="date"
                        themeVariant="dark"
                        accentColor="white"
                        disabled={!repeatEnds}
                      />
                    </View>
                  )}
                </>
              )}
            </View>

            {repeat && (
              <View className="flex gap-2 rounded-lg bg-stone-800 p-1">
                <View className="flex-row">
                  <Pressable
                    onPress={() => {
                      buildScheduledDays("Daily");
                      // setRepeatCadence("Daily");
                    }}
                    className={`w-1/4 rounded-l ${repeatCadence === "Daily" ? "bg-stone-400" : "bg-stone-600"} p-2`}>
                    <Text className="text-center text-xl text-white ">
                      Daily
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      buildScheduledDays("Weekly");
                      // setRepeatCadence("Weekly");
                    }}
                    className={`w-1/4 ${repeatCadence === "Weekly" ? "bg-stone-400" : "bg-stone-600"} p-2`}>
                    <Text className="text-center text-xl text-white">
                      Weekly
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      buildScheduledDays("Monthly");
                      // setRepeatCadence("Monthly");
                    }}
                    className={`w-1/4 ${repeatCadence === "Monthly" ? "bg-stone-400" : "bg-stone-600"} p-2`}>
                    <Text className="text-center text-xl text-white">
                      Monthly
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      buildScheduledDays("Yearly");
                      // setRepeatCadence("Yearly");
                    }}
                    className={`w-1/4 ${repeatCadence === "Yearly" ? "bg-stone-400" : "bg-stone-600"} rounded-r p-2`}>
                    <Text className="text-center text-xl text-white">
                      Yearly
                    </Text>
                  </Pressable>
                </View>

                {repeatCadence === "Daily" && (
                  <View className="my-2">
                    <Text className="text-center text-2xl text-white">
                      Repeats daily
                    </Text>
                    {/* Could also do a label and input asking Every: Day, 2 days, n days... */}
                  </View>
                )}

                {repeatCadence === "Weekly" && (
                  <View className="my-4 flex-row justify-center gap-3">
                    {scheduledDays.map((day) => (
                      <Pressable
                        key={day.label}
                        onPress={() => {
                          setScheduledDays((prev) =>
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
                          className={`${day.active ? "text-black" : "text-white"} text-xl`}>
                          {day.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {repeatCadence === "Monthly" && (
                  <>
                    <View className="my-4 flex-row flex-wrap">
                      {scheduledDays.map((day, index) => (
                        <Pressable
                          key={index}
                          onPress={() => {
                            setScheduledDays((prev) =>
                              prev.map((prevDay) => {
                                if (prevDay.label === day.label) {
                                  return { ...day, active: !day.active };
                                } else {
                                  return prevDay;
                                }
                              }),
                            );
                          }}
                          className={`${day.active ? "bg-stone-300" : "bg-black"} flex h-14 w-[14.28%] items-center justify-center border`}>
                          <Text
                            className={`${day.active ? "text-black" : "text-white"} text-xl`}>
                            {`${day.label} ${index + 1 > 28 ? "*" : ""}`}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <View className="mx-2 flex-row justify-center gap-2">
                      <Text className="text-2xl font-bold text-white">*</Text>
                      <Text className="text-white">
                        Selected days that don't fall in a given month will fall
                        on the last day of shorter months
                      </Text>
                    </View>
                  </>
                )}

                {repeatCadence === "Yearly" && (
                  <>
                    <View className="my-4 flex-row items-center justify-between px-3 py-2">
                      <Text className="text-xl font-semibold text-white">
                        On Date (MM/DD)
                      </Text>
                      <RNDateTimePicker
                        value={parseDateOrToday(
                          scheduledDays[0]?.label ?? undefined,
                        )}
                        onChange={(_, d) => {
                          if (d) {
                            setScheduledDays(buildYearlyScheduledDays(d));
                          }
                        }}
                        mode="date"
                        themeVariant="dark"
                        accentColor="white"
                      />
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {id && (
          <View className="mb-2 flex-row gap-2">
            <Pressable
              onPress={() => createActivitiesFromRoutine(id)}
              className="flex flex-1 items-center rounded border border-stone-300 p-2">
              <Text className="text-2xl text-stone-300">Rebuild</Text>
            </Pressable>
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
