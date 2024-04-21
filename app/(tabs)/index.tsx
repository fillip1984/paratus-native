import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

import TimelineCard from "../_components/TimelineCard";
import { FlexScrollView } from "../_components/ui/FlexScrollView";

import { SelectActivity } from "@/db/schema";
import { countActivities, findActivities } from "@/stores/activityStore";

export default function Home() {
  const [activities, setActivities] = useState<SelectActivity[]>([]);
  const [countActs, setCountActs] = useState(0);

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        const result = await findActivities({
          date: new Date(),
          filter: "All",
        });
        setActivities(result);
        const c = await countActivities();
        setCountActs(c[0].count);
      }

      fetchData();
    }, []),
  );

  return (
    // TODO: still can't figure out how to style the safe area's text. Tried StatusBar from expo but can't get it to comply
    <SafeAreaView className="bg-black">
      <View className="h-screen">
        <Header activities={activities} countActs={countActs} />
        <TimelineFilter />
        <Timeline activities={activities} />
      </View>
    </SafeAreaView>
  );
}

const Header = ({
  activities,
  countActs,
}: {
  activities: SelectActivity[];
  countActs: number;
}) => {
  return (
    <Text className="text-center text-2xl text-white">
      {countActs} <Text className="text-white/50">activities for</Text>{" "}
      Wednesday
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

const Timeline = ({ activities }: { activities: SelectActivity[] }) => {
  return (
    <FlexScrollView>
      {activities.map((activity) => (
        <TimelineCard key={activity.id} activity={activity} />
      ))}
      {/* <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard />
      <NatureCard /> */}
    </FlexScrollView>
  );
};
