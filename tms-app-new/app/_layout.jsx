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
      </Stack>
    </AuthProvider>
  );
}
