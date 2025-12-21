import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
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
            title: "orders page title",
            headerShown: true,
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
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
