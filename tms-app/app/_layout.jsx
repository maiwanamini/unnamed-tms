import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
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
        <Stack.Screen
          name="orders/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
