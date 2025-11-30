import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "The Unnamed TMS",
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack>
  );
}
