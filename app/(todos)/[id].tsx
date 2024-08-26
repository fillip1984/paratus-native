import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Keyboard,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";

import {
  scheduleNotificationForTodo,
  unscheduleNotificationsForTodo,
} from "@/notifications";
import { findTodo, TodosSelect, updateTodo } from "@/stores/todoStore";
export default function TodoDetails() {
  const params = useLocalSearchParams();
  const id =
    params["id"] === "new" ? undefined : parseInt(params["id"] as string, 10);
  const isNew = id === undefined;

  const [text, setText] = useState("");
  const [timerMinutes, setTimerMinutes] = useState("");

  const [session, setSession] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async (id: number) => {
        const result = await findTodo(id);
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

  const startStopTimer = async () => {
    updateTodo({
      id,
      text,
      timer: parseInt(timerMinutes, 10),
      complete: false,
    } as TodosSelect);
    Keyboard.dismiss();
    setIsPlaying((prev) => !prev);
    const notificationId = await scheduleNotificationForTodo({
      id,
      text,
      complete: false,
      timer: parseInt(timerMinutes, 10),
    } as TodosSelect);
    if (notificationId !== undefined) {
      unscheduleNotificationsForTodo(id!, notificationId);
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setSession((prev) => prev + 1);

    unscheduleNotificationsForTodo(id!);

    // hacky way to reset isComplete
    setTimeout(() => setIsComplete(false), 5000);
  };

  return (
    <SafeAreaView className="bg-stone-800">
      <View className="flex h-full gap-8 bg-stone-900 px-2">
        <Text className="text-3xl text-white">{text}</Text>
        <TextInput
          value={timerMinutes.toString()}
          onPress={() => setTimerMinutes("")}
          onChangeText={(t) => setTimerMinutes(t)}
          className="rounded bg-white p-2 text-xl"
          inputMode="numeric"
        />
        <View className="flex flex-row gap-2">
          <Pressable
            onPress={reset}
            className="flex items-center justify-center rounded bg-orange-500 px-4 py-2">
            <Text className="text-4xl text-white">Reset</Text>
          </Pressable>
          <Pressable
            onPress={startStopTimer}
            className="flex flex-1 items-center justify-center rounded bg-blue-500 px-4 py-2">
            <Text className="text-4xl text-white">
              {isPlaying ? "Stop" : "Go"}
            </Text>
          </Pressable>
        </View>
        <View className="mb-4 mt-auto flex items-center justify-center">
          <CountdownCircleTimer
            key={session}
            isPlaying={isPlaying}
            duration={parseInt(timerMinutes, 10) * 60}
            onComplete={() => {
              setIsComplete(true);
              reset();
            }}
            colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
            colorsTime={[7, 5, 2, 0]}
            size={400}
            strokeWidth={30}>
            {({ remainingTime, color }) => (
              <Text style={{ color, fontSize: 60, fontWeight: "bold" }}>
                {remainingTime ? remainingTime : ""}
              </Text>
            )}
          </CountdownCircleTimer>
          {isComplete && (
            <ConfettiCannon count={200} origin={{ x: -10, y: -10 }} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
