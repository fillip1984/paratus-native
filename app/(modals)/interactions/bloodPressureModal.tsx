import { SimpleLineIcons } from "@expo/vector-icons";
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

export default function BloodPressureModal() {
  const [date, setDate] = useState(new Date());
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");

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

        {/* heart shape */}
        <View className="relative -z-10">
          <View className="absolute w-full">
            <View className="flex items-center">
              <SimpleLineIcons name="heart" size={370} color="black" />
            </View>
          </View>
        </View>

        {/* form */}
        <View className="mt-20 flex-row justify-around px-12">
          <View className="items-center">
            <Text className="text-white">Systolic</Text>
            <TextInput
              value={systolic}
              onChangeText={(t) => setSystolic(t)}
              keyboardType="number-pad"
              placeholder="136"
              className="mt-2 text-6xl text-white"
            />
            <Text className="text-white/30">mmHg</Text>
          </View>
          <View className="items-center">
            <Text className="text-white">Diastolic</Text>
            <TextInput
              value={diastolic}
              onChangeText={(t) => setDiastolic(t)}
              keyboardType="number-pad"
              placeholder="93"
              className="mt-2 text-6xl text-white"
            />
            <Text className="text-white/30">mmHg</Text>
          </View>
        </View>

        <View className="mt-4 items-center">
          <Text className="text-white">Pulse</Text>
          <TextInput
            value={pulse}
            onChangeText={(t) => setPulse(t)}
            keyboardType="number-pad"
            placeholder="70"
            className="mt-2 text-6xl text-white"
          />
          <Text className="text-white/30">beat/Min</Text>
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
