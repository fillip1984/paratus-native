import Entypo from "@expo/vector-icons/Entypo";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useDebounceCallback } from "usehooks-ts";

import { FlexScrollView } from "../_components/ui/FlexScrollView";

import {
  createTodos,
  deleteTodo,
  findTodos,
  TodosSelect,
  toggleTodo,
  updateTodo,
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
    setTodos(
      todos.map((todo) =>
        todo.id === todoUpdate.id
          ? { ...todo, complete: !todo.complete }
          : todo,
      ),
    );
    toggleTodo(todoUpdate.id, !todoUpdate.complete);
  };

  const debouncedUpdate = useDebounceCallback(updateTodo, 800);
  const handleTodoUpdate = (todoUpdate: TodosSelect) => {
    setTodos(
      todos.map((todo) =>
        todo.id === todoUpdate.id ? { ...todo, text: todoUpdate.text } : todo,
      ),
    );
    debouncedUpdate(todoUpdate);
  };

  const handleSwipe = async (
    direction: "left" | "right",
    swipeable: Swipeable,
    todo: TodosSelect,
  ) => {
    switch (direction) {
      case "right":
        await deleteTodo(todo.id);
        setTodos((prev) => prev.filter((t) => t.id !== todo.id));
        swipeable.close();
        break;
      case "left":
        // currently doing nothing
        break;
    }
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
              handleSwipe={handleSwipe}
              handleTodoUpdate={handleTodoUpdate}
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
  handleSwipe,
  handleTodoUpdate,
}: {
  todo: TodosSelect;
  handleTodoToggle: (todo: TodosSelect) => void;
  handleSwipe: (
    direction: "left" | "right",
    swipeable: Swipeable,
    todo: TodosSelect,
  ) => void;
  handleTodoUpdate: (todo: TodosSelect) => void;
}) => {
  return (
    <Link href={`/(todos)/${todo.id}`} asChild>
      <Pressable>
        <Swipeable
          renderRightActions={RightActions}
          onSwipeableOpen={(direction, swipeable) =>
            handleSwipe(direction, swipeable, todo)
          }>
          <View className="flex min-h-[100px] w-full flex-row items-center gap-4 rounded bg-stone-400 p-2">
            <Pressable
              onPress={() => handleTodoToggle(todo)}
              className={`h-8 w-8 rounded-full border ${todo.complete ? "bg-green-600" : ""}`}
            />
            <View className="flex w-0 flex-grow">
              <TextInput
                value={todo.text}
                onChangeText={(t) => handleTodoUpdate({ ...todo, text: t })}
                multiline
                numberOfLines={4}
                className="font-semibold"
              />
            </View>
            <Pressable>
              <Entypo name="stopwatch" size={36} color="black" />
            </Pressable>
          </View>
        </Swipeable>
      </Pressable>
    </Link>
  );
};

const RightActions = (
  progress: Animated.AnimatedInterpolation<string | number>,
  dragX: Animated.AnimatedInterpolation<string | number>,
) => {
  const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [0.7, 0],
  });

  return (
    <View className="flex-1 items-end justify-center bg-red-600">
      <Animated.Text
        style={{
          color: "white",
          paddingHorizontal: 65,
          fontWeight: "600",
          transform: [{ scale }],
        }}>
        Delete
      </Animated.Text>
    </View>
  );
};
