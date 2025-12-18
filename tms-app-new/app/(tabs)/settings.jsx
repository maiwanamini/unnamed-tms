import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import global from "../../styles/global";
import { View } from "react-native";
import { ThemedText } from "../../components/ThemedText";

const Settings = () => {
  return (
    <SafeAreaView style={global.pageWrap}>
      {/* body */}
      <View style={global.bodyWrap}>
        <View style={global.contentWrap}>
          <View style={global.textWrapLargeCenter}>
            <ThemedText>Settings</ThemedText>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
