import { FontAwesome, FontAwesome6, SimpleLineIcons } from "@expo/vector-icons";
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
import { findBloodPressureReadings } from "@/stores/bloodPressureReadingStore";
import { findNoteWithActivityId } from "@/stores/noteStore";
import { yyyyMMddHyphenated } from "@/utils/date";

export default function NoteModal() {
  const params = useLocalSearchParams();
  const activityId = params["activityId"]
    ? Number(params["activityId"] as string)
    : undefined;

  return (
    <SafeAreaView className="bg-stone-800">
      <View className="flex h-screen">
        {activityId && <EntryForm activityId={activityId} />}
        <PreviousBloodPressureReadings />
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
  const [body, setBody] = useState("");

  const { data: note } = useQuery({
    queryKey: ["findNoteWithActivityId", activityId],
    queryFn: () => findNoteWithActivityId(activityId),
    enabled: !!activityId,
  });

  // when editing, put back previous values
  useEffect(() => {
    if (note) {
      setDate(note.date);
      setBody(note.body);
    }
  }, [note]);

  const mutation = useMutation({
    mutationFn: () =>
      completeActivity(activityId, undefined, undefined, {
        date,
        body,
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
    return !!body;
  };

  return (
    // only easy way I found to have the keyboard dismiss on tap outside of fields. Would like for this item to not scroll
    <ScrollView keyboardShouldPersistTaps="handled">
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

      {/* form */}
      <View className="m-4 flex">
        <TextInput
          value={body}
          multiline
          numberOfLines={20}
          onChangeText={(t) => setBody(t)}
          placeholder="Take a note"
          className="h-full max-h-56 rounded bg-white p-2"
        />
      </View>
    </ScrollView>
  );
};

const PreviousBloodPressureReadings = () => {
  const { data: previousBPs } = useQuery({
    queryKey: ["bloodPressureReadings"],
    queryFn: () => findBloodPressureReadings(),
  });

  return (
    <ScrollView>
      <View className="flex gap-2 pb-80">
        {previousBPs?.map((bloodPressureReading) => (
          <View
            key={bloodPressureReading.id}
            className="w-full items-center p-2">
            <Text className="text-xl text-white">
              {format(bloodPressureReading.date, yyyyMMddHyphenated)}
            </Text>
            <View className="mt-2 w-full flex-row justify-center gap-8">
              <View className="items-center gap-1">
                <FontAwesome name="heart" size={36} color="white" />
                <Text className="text-4xl text-white">
                  {bloodPressureReading.systolic}
                </Text>
              </View>
              <View className="items-center gap-1">
                <FontAwesome6 name="heart" size={36} color="white" />
                <Text className="text-4xl text-white">
                  {bloodPressureReading.diastolic}
                </Text>
              </View>
              <View className="items-center gap-1">
                <FontAwesome6 name="heart-pulse" size={36} color="white" />
                <Text className="text-4xl text-white">
                  {bloodPressureReading.pulse
                    ? bloodPressureReading.pulse
                    : "N/A"}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
