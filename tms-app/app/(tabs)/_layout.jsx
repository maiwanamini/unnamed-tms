import { Tabs, Redirect } from "expo-router";
import colors from "../../theme/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";

export default function TabsLayout() {
  const { token, loading } = useAuth();

  if (loading) return null;
  if (!token) return <Redirect href="/(auth)" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarButton: (props) => {
          const { onPress, onLongPress, children, ...rest } = props;
          return (
            <Pressable
              {...rest}
              onPress={(e) => {
                Haptics.selectionAsync().catch(() => {});
                onPress?.(e);
              }}
              onLongPress={(e) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {}
                );
                onLongPress?.(e);
              }}
            >
              {children}
            </Pressable>
          );
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
