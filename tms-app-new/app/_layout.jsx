import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          title: "The Unnamed TMS",
          headerShown: true,
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack>
  );
}
