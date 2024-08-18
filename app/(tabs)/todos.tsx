import Checkbox from "expo-checkbox";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

import { FlexScrollView } from "../_components/ui/FlexScrollView";

import {
  createTodos,
  findTodos,
  TodosSelect,
  toggleTodo,
} from "@/stores/todoStore";

export default function Todos() {
  const [todos, setTodos] = useState<TodosSelect[]>([]);

  const fetchData = async () => {
    const result = await findTodos();
    setTodos(result);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const handleTodoToggle = (todoUpdate: TodosSelect) => {
    toggleTodo(todoUpdate.id, !todoUpdate.complete);
    setTodos(
      todos.map((todo) =>
        todo.id === todoUpdate.id
          ? { ...todo, complete: !todo.complete }
          : todo,
      ),
    );
  };

  const importSampleTodos = async () => {
    const sampleTodos = [
      {
        text: "Finish creating an app to track todos",
      },
      {
        text: "Enhance it to take photos of things we would like to remedy",
      },
      {
        text: "Copy another todo app to make it more feature rich",
      },
    ] as TodosSelect[];
    for (const todo of sampleTodos) {
      await createTodos({ text: todo.text });
    }
    fetchData();
  };

  return (
    <SafeAreaView className="bg-black">
      <View className="flex h-screen bg-black px-2">
        {todos.length === 0 && (
          <View className="flex h-1/2 items-center justify-center gap-2">
            <Text className="text-xl font-bold text-white">
              There are no todos, please add one
            </Text>
            <Pressable
              onPress={importSampleTodos}
              className="rounded bg-stone-500 px-4 py-2">
              <Text className="text-2xl">Import sample todos</Text>
            </Pressable>
          </View>
        )}
        <FlexScrollView>
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              handleTodoToggle={handleTodoToggle}
            />
          ))}
        </FlexScrollView>
      </View>
    </SafeAreaView>
  );
}

const TodoCard = ({
  todo,
  handleTodoToggle,
}: {
  todo: TodosSelect;
  handleTodoToggle: (todo: TodosSelect) => void;
}) => {
  return (
    <Pressable className="flex min-h-[100px] w-full rounded bg-stone-400 p-2">
      <Checkbox
        value={todo.complete ?? false}
        onValueChange={() => handleTodoToggle(todo)}
      />
      <Text>Todo</Text>
    </Pressable>
    // <Link href={`/(routines)/${routine.id}`} asChild>
    //   <Pressable className="flex w-full rounded bg-stone-400 p-2">
    //     <Text className="text-2xl">{routine.name}</Text>
    //     <Text className="text-small">{routine.description}</Text>
    //     <View className="my-2">
    //       <View className="my-2 flex-row items-center gap-3">
    //         <Feather name="clock" size={20} color="black" />
    //         <Text>
    //           {`${format(
    //             parse(routine.fromTime, HH_mm_aka24hr, new Date()),
    //             h_mm_ampm,
    //           )} - ${format(
    //             parse(routine.toTime, HH_mm_aka24hr, new Date()),
    //             h_mm_ampm,
    //           )}`}
    //         </Text>
    //       </View>
    //       {routine.repeat && (
    //         <View className="my-2 flex flex-row items-center gap-2">
    //           <Feather name="repeat" size={24} color="black" />
    //           {routine.repeatCadence === "Daily" && <Text>Daily</Text>}
    //           {routine.repeatCadence === "Weekly" && (
    //             <View className="flex flex-row gap-2">
    //               <Text>Weekly:</Text>
    //               {routine.scheduledDays.map((scheduledDay) => (
    //                 <Text
    //                   key={scheduledDay.label}
    //                   className={`text-black ${scheduledDay.active ? "" : "opacity-20"}`}>
    //                   {scheduledDay.label}
    //                 </Text>
    //               ))}
    //             </View>
    //           )}
    //           {routine.repeatCadence === "Monthly" && (
    //             <View className="mr-10 flex-row flex-wrap">
    //               <Text>Monthly: </Text>
    //               {routine.scheduledDays.map((scheduledDay) => (
    //                 <Text
    //                   key={scheduledDay.label}
    //                   className={`text-black ${scheduledDay.active ? "" : "opacity-20"}`}>
    //                   {scheduledDay.label},{" "}
    //                 </Text>
    //               ))}
    //             </View>
    //           )}
    //           {routine.repeatCadence === "Yearly" && (
    //             <View className="mr-10 flex-row flex-wrap">
    //               <Text>Yearly: </Text>
    //               {routine.scheduledDays.map((scheduledDay) => (
    //                 <Text
    //                   key={scheduledDay.label}
    //                   className={`text-black ${scheduledDay.active ? "" : "opacity-20"}`}>
    //                   {scheduledDay.label}
    //                 </Text>
    //               ))}
    //             </View>
    //           )}
    //         </View>
    //       )}
    //       <View className="my-2 flex-row items-center gap-2">
    //         <Ionicons name="trophy-outline" size={24} color="black" />
    //         <Text>1/10</Text>
    //       </View>
    //     </View>
    //   </Pressable>
    // </Link>
  );
};
