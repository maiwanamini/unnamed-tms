import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import global from "../../styles/global";
import { View } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../context/AuthContext";
import { TouchableOpacity, Text } from "react-native";

const Settings = () => {
  const { logout } = useAuth();
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
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
