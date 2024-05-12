import { Ionicons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { completeActivity } from "@/stores/activityStore";
import {
  findWeighIns,
  findWeighInsWithActivityId,
} from "@/stores/weighInStore";
import { yyyyMMddHyphenated } from "@/utils/date";

export default function WeighInModal() {
  const params = useLocalSearchParams();
  const activityId = params["activityId"]
    ? Number(params["activityId"] as string)
    : undefined;

  return (
    <SafeAreaView className="bg-stone-800">
      <View className="flex h-screen">
        {activityId && <EntryForm activityId={activityId} />}
        <PreviousWeighIns />
      </View>
    </SafeAreaView>
  );
}

const TopActionsBar = ({
  onSubmit,
  isValid,
}: {
  onSubmit: () => void;
  isValid: () => boolean;
}) => {
  return (
    <View className="mx-2 mt-3 flex-row justify-between">
      <Pressable onPress={() => router.dismiss()}>
        <Text className="text-xl font-bold text-white">Cancel</Text>
      </Pressable>
      <Pressable onPress={onSubmit} disabled={!isValid()}>
        <Text
          className={`text-xl font-bold ${isValid() ? "text-white" : "text-white/30"}`}>
          Save
        </Text>
      </Pressable>
    </View>
  );
};

const EntryForm = ({ activityId }: { activityId: number }) => {
  const [date, setDate] = useState(new Date());
  const [weight, setWeight] = useState("");
  const [bodyFatPercentage, setBodyFatPercentage] = useState("");

  const { data: weighIn } = useQuery({
    queryKey: ["findWeighInsWithActivityId", activityId],
    queryFn: () => findWeighInsWithActivityId(activityId),
    enabled: !!activityId,
  });

  // when editing, put back previous values
  useEffect(() => {
    if (weighIn) {
      setDate(weighIn.date);
      setWeight(weighIn.weight.toString());
      setBodyFatPercentage(
        weighIn.bodyFatPercentage ? weighIn.bodyFatPercentage.toString() : "",
      );
    }
  }, [weighIn]);

  const mutation = useMutation({
    mutationFn: () =>
      completeActivity(activityId, undefined, {
        date,
        weight: Number(weight),
        bodyFatPercentage: bodyFatPercentage
          ? Number(bodyFatPercentage)
          : undefined,
        activityId,
      }),
    onSuccess: () => {
      router.dismiss();
    },
  });

  const onSubmit = () => {
    if (isValid()) {
      mutation.mutate();
    }
  };

  const isValid = () => {
    return !!weight;
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" className="h-full">
      <TopActionsBar onSubmit={onSubmit} isValid={isValid} />
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
  );
};

const PreviousWeighIns = () => {
  const { data: previousWeighIns } = useQuery({
    queryKey: ["weighIns"],
    queryFn: () => findWeighIns(),
  });

  return (
    <ScrollView>
      <View className="flex gap-2 pb-80">
        {previousWeighIns?.map((weighIn) => (
          <View key={weighIn.id} className="w-full items-center p-2">
            <Text className="text-xl text-white">
              {format(weighIn.date, yyyyMMddHyphenated)}
            </Text>
            <View className="mt-2 w-full flex-row justify-center gap-8">
              <View className="items-center gap-1">
                <Ionicons name="scale-outline" size={36} color="white" />
                <Text className="text-4xl text-white">{weighIn.weight}</Text>
              </View>
              <View className="items-center gap-1">
                <Ionicons name="body" size={36} color="white" />
                <Text className="text-4xl text-white">
                  {weighIn.bodyFatPercentage
                    ? weighIn.bodyFatPercentage + "%"
                    : ""}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
