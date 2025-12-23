import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import global from "../../styles/global";
import { View } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../context/AuthContext";
import { TouchableOpacity, Text } from "react-native";
import { ThemedButton } from "../../components/ThemedButton";
import { useRouter } from "expo-router";

const Settings = () => {
  const { logout } = useAuth();
  const router = useRouter();
  return (
    <SafeAreaView style={global.pageWrap}>
      {/* body */}
      <View style={global.bodyWrap}>
        <View style={global.contentWrap}>
          <View style={global.textWrapLargeCenter}>
            <ThemedText>Settings</ThemedText>
            <TouchableOpacity onPress={logout}>
              <Text>Logout</Text>
            </TouchableOpacity>
            <ThemedButton
              variant="ghost"
              onPress={() => router.push("/termsModal")}
            >
              Terms & Privacy
            </ThemedButton>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
