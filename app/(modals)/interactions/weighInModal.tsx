import { Ionicons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function WeighInModal() {
  const [date, setDate] = useState(new Date());
  const [weight, setWeight] = useState("");
  const [bodyFatPercentage, setBodyFatPercentage] = useState("");

  return (
    <SafeAreaView className="bg-stone-800">
      <ScrollView keyboardShouldPersistTaps="handled" className="h-full">
        <TopActionsBar />
        <View className="mt-2 items-center">
          <RNDateTimePicker
            value={date}
            onChange={(_, d) => {
              if (d) setDate(d);
            }}
            mode="date"
            themeVariant="dark"
            accentColor="white"
          />
        </View>

        {/* background shape */}
        <View className="relative -z-10">
          <View className="absolute w-full">
            <View className="flex items-center">
              <Ionicons name="scale-outline" size={430} color="gray" />
            </View>
          </View>
        </View>

        {/* form */}
        {/* TODO: prevent multiple decimals from being entered */}
        {/* TODO: dismiss keyboard for touches anywhere on the screen */}
        {/* TODO: prevent jitter when entering values (set fixed width maybe) */}
        <View className="mt-72 flex-row justify-center gap-12 px-12">
          <View className="items-center">
            <Text className="text-white">Weight (lbs)</Text>
            <TextInput
              value={weight}
              onChangeText={(t) => setWeight(t)}
              keyboardType="decimal-pad"
              placeholder="175.05"
              className="mt-2 text-6xl text-white"
            />
          </View>
          <View className="items-center">
            <Text className="text-white">Body Fat %</Text>
            <TextInput
              value={bodyFatPercentage}
              onChangeText={(t) => setBodyFatPercentage(t)}
              keyboardType="decimal-pad"
              placeholder="17.4"
              className="mt-2 text-6xl text-white"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const TopActionsBar = () => {
  return (
    <View className="mx-2 mt-3 flex-row justify-between">
      <Pressable onPress={() => router.dismiss()}>
        <Text className="text-xl font-bold text-white">Cancel</Text>
      </Pressable>
      <Pressable>
        <Text className="text-xl font-bold text-white">Save</Text>
      </Pressable>
    </View>
  );
};
