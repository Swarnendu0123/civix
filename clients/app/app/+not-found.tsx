import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Colors } from "@/constants/Colors";

export default function NotFoundScreen() {
  const { colorScheme } = useTheme();
  const themedStyles = createStyles(colorScheme);
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={themedStyles.container}>
        <ThemedText type="title">This screen does not exist.</ThemedText>
        <Link href="/" style={themedStyles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      backgroundColor: Colors[colorScheme].background,
    },
    link: {
      marginTop: 15,
      paddingVertical: 15,
    },
  });
