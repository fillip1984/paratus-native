import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { Keyboard, SafeAreaView, Text, TextInput, View } from "react-native";

interface Area {
  name: string;
  icon?: React.ReactElement;
}

export default function PlannerScreen() {
  const [areas, setAreas] = useState<Area[]>([
    {
      name: "Inbox",
      icon: <FontAwesome6 name="inbox" size={32} color="white" />,
    },
  ]);

  const handleAddArea = (areaText: string) => {
    setAreas((prev) => [...prev, { name: areaText } as Area]);
  };

  const handleRemoveArea = () => {};

  return (
    <SafeAreaView className="bg-black">
      <View className="flex h-screen bg-black px-2">
        <Text className="my-2 text-2xl font-bold text-white">Projects</Text>
        <View className="flex-1">
          <FlashList
            data={areas}
            renderItem={({ item, index }) => <AreaCard area={item} />}
            ListFooterComponent={<NewAreaCard handleAddArea={handleAddArea} />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const AreaCard = ({ area }: { area: Area }) => {
  return (
    <View className="mb-1 flex h-14 flex-row items-center gap-4 rounded-lg bg-slate-800 p-2">
      <View className="w-12 items-center">{area.icon}</View>
      <Text className="text-xl text-white">{area.name}</Text>
    </View>
  );
};

const NewAreaCard = ({
  handleAddArea,
}: {
  handleAddArea: (areaText: string) => void;
}) => {
  const [newArea, setNewArea] = useState("");

  const handleSubmit = () => {
    Keyboard.dismiss();
    handleAddArea(newArea);
    setNewArea("");
  };

  return (
    <View className="mt-2 flex flex-row items-center gap-4 rounded-lg bg-slate-800 p-2">
      <TextInput
        value={newArea}
        onChangeText={(t) => setNewArea(t)}
        onSubmitEditing={handleSubmit}
        placeholder="Add a new project..."
        className="w-full p-2 text-xl text-white placeholder:text-gray-400"
      />
    </View>
  );
};
