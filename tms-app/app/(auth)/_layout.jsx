import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "The Unnamed TMS",
          headerTitleStyle: { fontWeight: "400" },
        }}
        name="index"
      />
    </Stack>
  );
}
