import { View } from "react-native";
import { StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { ThemedText } from "./ThemedText";
import colors from "../theme/colors";
import React from "react";

const Tag = () => {
  return (
    <View style={styles.tagWrap}>
      <MaterialCommunityIcons
        name="package-up"
        size={16}
        color={colors.accent}
      />
      <ThemedText style={styles.tagText}>Tag</ThemedText>
    </View>
  );
};

export default Tag;

const styles = StyleSheet.create({
  tagWrap: {
    // width: "fit-content",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.backgroundDarker,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tagText: {
    color: colors.accent,
    fontSize: 12,
  },
});
