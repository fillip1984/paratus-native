import { ScrollView, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export function FlexScrollView({ children }: { children: React.ReactNode[] }) {
  return (
    <GestureHandlerRootView>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex gap-2 px-2 pb-80">{children}</View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}
