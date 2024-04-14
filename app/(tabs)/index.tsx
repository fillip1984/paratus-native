import { useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

import { FlexScrollView } from "../_components/ui/FlexScrollView";

import { NatureCard } from "@/app/_components/NatureCard";

export default function home() {
  return (
    // TODO: still can't figure out how to style the safe area's text. Tried StatusBar from expo but can't get it to comply
    <SafeAreaView className="bg-black">
      <View className="h-screen">
        <Header />
        <TimelineFilter />
        <Timeline />
      </View>
    </SafeAreaView>
  );
}

const Header = () => {
  return (
    <Text className="text-center text-2xl text-white">
      12 <Text className="text-white/50">activities for</Text> Wednesday
    </Text>
  );
};

const TimelineFilter = () => {
  const [selectedFilter, setSelectedFilter] = useState("Available");

  return (
    <Pressable className="flex flex-row px-2 py-4">
      <Pressable
        onPress={() => setSelectedFilter("Available")}
        className={`w-1/4 items-center rounded-l-lg p-4 ${selectedFilter === "Available" ? "bg-stone-200" : "bg-stone-500"}`}>
        <Text>Available</Text>
      </Pressable>
      <Pressable
        onPress={() => setSelectedFilter("Complete")}
        className={`w-1/4 items-center p-4 ${selectedFilter === "Complete" ? "bg-stone-200" : "bg-stone-500"}`}>
        <Text>Complete</Text>
      </Pressable>
      <Pressable
        onPress={() => setSelectedFilter("Skipped")}
        className={`w-1/4 items-center p-4 ${selectedFilter === "Skipped" ? "bg-stone-200" : "bg-stone-500"}`}>
        <Text>Skipped</Text>
      </Pressable>
      <Pressable
        onPress={() => setSelectedFilter("All")}
        className={`w-1/4 items-center rounded-r-lg p-4 ${selectedFilter === "All" ? "bg-stone-200" : "bg-stone-500"}`}>
        <Text>All</Text>
      </Pressable>
    </Pressable>
  );
};

const Timeline = () => {
  return (
    <FlexScrollView>
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
    </FlexScrollView>
  );
};
