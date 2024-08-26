import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  Text,
  View,
  TextInput,
  Keyboard,
} from "react-native";

import { scheduleNotificationForTodo } from "@/notifications";
import { findTodo, TodosSelect, updateTodo } from "@/stores/todoStore";
export default function TodoDetails() {
  const params = useLocalSearchParams();
  const id =
    params["id"] === "new" ? undefined : parseInt(params["id"] as string, 10);
  const isNew = id === undefined;

  const [text, setText] = useState("");
  const [timerMinutes, setTimerMinutes] = useState("");

  useFocusEffect(
    useCallback(() => {
      const fetchData = async (id: number) => {
        const result = await findTodo(id);
        console.log({ result });
        if (result) {
          setText(result.text);
          setTimerMinutes(result.timer ? result.timer.toString() : "");
        }
      };

      if (!isNew) {
        fetchData(id);
      }
    }, [id, isNew]),
  );

  // state to store time
  const [time, setTime] = useState(0);
  const [mode, setMode] = useState<"stopWatch" | "timer">("timer");

  // state to check stopwatch running or not
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTime(parseInt(timerMinutes, 10) * 60 * 60);
  }, [timerMinutes]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRunning) {
      if (mode === "timer" && time === 0) {
        setIsRunning(false);
        setIsRunning(false);
      } else {
        intervalId = setInterval(
          () => setTime(mode === "timer" ? time - 1 : time + 1),
          10,
        );
      }
    }
    return () => clearInterval(intervalId);
  }, [isRunning, time, mode]);

  // Hours calculation
  const hours = Math.floor(time / 360000);

  // Minutes calculation
  const minutes = Math.floor((time % 360000) / 6000);

  // Seconds calculation
  const seconds = Math.floor((time % 6000) / 100);

  // Milliseconds calculation
  const milliseconds = time % 100;

  // Method to start and stop timer
  const startAndStop = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      scheduleNotificationForTodo({
        text,
        timer: time,
        complete: false,
      } as TodosSelect);
    }
  };

  // Method to reset timer back to 0
  const reset = () => {
    if (mode === "timer") {
      setTime(parseInt(timerMinutes, 10) * 60 * 60);
    } else {
      setTime(0);
    }
  };

  const toggleMode = () => {
    if (mode === "stopWatch") {
      setIsRunning(false);
      setMode("timer");
      setTime(parseInt(timerMinutes, 10) * 60 * 60);
    } else {
      setIsRunning(false);
      setMode("stopWatch");
      setTime(0);
    }
  };

  const setNewTimer = () => {
    updateTodo({
      id,
      text,
      timer: parseInt(timerMinutes, 10),
      complete: false,
    } as TodosSelect);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView className="bg-black">
      <View className="flex items-center border border-b-0 border-white">
        <View className="mt-2 h-1 w-24 rounded-lg bg-white" />
      </View>
      <View>
        <Text className="text-3xl text-white">{text}</Text>
        <TextInput
          value={timerMinutes.toString()}
          onChangeText={(t) => setTimerMinutes(t)}
          className="rounded bg-white p-2 text-xl"
          inputMode="numeric"
        />
        <Pressable
          onPress={setNewTimer}
          className="my-2 flex items-center bg-slate-500 px-2 py-4">
          <Text className="text-4xl text-white">Go</Text>
        </Pressable>
      </View>
      <View className="flex h-screen items-center justify-center gap-8 bg-black">
        <View className="flex flex-row items-center">
          <View className="flex w-[5.5rem] items-center justify-center">
            <Text
              className={`text-6xl ${hours > 0 ? "text-white" : "text-gray-500"}`}>
              {hours.toString().padStart(2, "0")}
            </Text>
          </View>
          <Text className="flex items-center justify-center text-6xl text-white">
            :
          </Text>
          <View className="flex w-[5.5rem] items-center justify-center">
            <Text
              className={`text-6xl ${hours > 0 || minutes > 0 ? "text-white" : "text-gray-500"}`}>
              {minutes.toString().padStart(2, "0")}
            </Text>
          </View>
          <Text className="flex items-center justify-center text-6xl text-white">
            :
          </Text>
          <View className="flex w-[5.5rem] items-center justify-center">
            <Text
              className={`text-6xl ${minutes > 0 || seconds > 0 ? "text-white" : "text-gray-500"}`}>
              {seconds.toString().padStart(2, "0")}
            </Text>
          </View>
          {mode === "stopWatch" && (
            <>
              <Text className="flex items-center justify-center text-6xl text-white">
                :
              </Text>
              <View className="flex w-[5.5rem] items-center justify-center">
                <Text className="text-6xl text-white">
                  {milliseconds.toString().padStart(2, "0")}
                </Text>
              </View>
            </>
          )}
        </View>
        <View className="flex w-full flex-row items-center gap-28">
          <Pressable
            onPress={reset}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 p-2">
            <Text className="text-2xl text-white">Reset</Text>
          </Pressable>
          <Pressable
            onPress={startAndStop}
            className="flex h-20 w-24 items-center justify-center rounded bg-green-400 px-4 py-2">
            <Text className="text-2xl text-white">
              {isRunning ? "Stop" : "Start"}
            </Text>
          </Pressable>
          <Pressable
            onPress={toggleMode}
            className="flex h-20 w-20 items-center justify-center rounded bg-blue-400">
            {mode === "stopWatch" ? (
              <FontAwesome6 name="stopwatch" size={32} color="white" />
            ) : (
              <FontAwesome6 name="hourglass-half" size={32} color="white" />
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
