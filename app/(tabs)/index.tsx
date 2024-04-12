import { SafeAreaView, ScrollView, Text, View } from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

export default function home() {
  const fling = Gesture.Fling()
    .cancelsTouchesInView(true)
    .direction(Directions.LEFT | Directions.RIGHT)
    .onEnd((e) => console.log({ msg: "flung", e }));
  return (
    // TODO: still can't figure out how to style the safe area's text. Tried StatusBar from expo but can't get it to comply
    <SafeAreaView className="bg-black">
      <GestureHandlerRootView>
        <GestureDetector gesture={fling}>
          <View className="">
            <Text className="text-center text-2xl text-white">
              12 <Text className="text-white/50">activities for</Text> Wednesday
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex gap-2">
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
              </View>
            </ScrollView>
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const NatureCard = () => {
  return (
    <View className="h-48 w-full bg-stone-400">
      <Text>Test</Text>
    </View>
  );
};
