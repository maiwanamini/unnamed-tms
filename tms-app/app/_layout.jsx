import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "The Unnamed TMS",
            headerTitleStyle: { fontWeight: "400" },
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
          name="(auth)"
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
        <Stack.Screen
          name="termsModal"
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
