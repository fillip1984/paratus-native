import { SafeAreaView, ScrollView, Text, View } from "react-native";

export default function home() {
  return (
    // TODO: still can't figure out how to style the safe area's text. Tried StatusBar from expo but can't get it to comply
    <SafeAreaView className="bg-black">
      <View className="">
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
