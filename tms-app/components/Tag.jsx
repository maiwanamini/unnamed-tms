import { View } from "react-native";
import { StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { ThemedText } from "./ThemedText";
import colors from "../theme/colors";
import React from "react";

// Scalable, reusable Tag component with variants
// Variants supported: pickup, dropoff, planned, moving, completed, canceled, distance
// Default spacing: 4px vertical/horizontal, gap 6px, icon 16px.
// Distance tag: 8px padding, neutral border, uses provided distance (defaults to "16km").

const VARIANTS = {
  pickup: {
    icon: "arrow-down-circle-outline",
    textColor: "#0C6A2A",
    bgColor: "rgba(12, 106, 42, 0.15)",
  },
  dropoff: {
    icon: "arrow-up-circle-outline",
    textColor: "#7A1F1F",
    bgColor: "rgba(122, 31, 31, 0.15)",
  },
  planned: {
    icon: "clock-outline",
    textColor: "#D08700",
    bgColor: "rgba(208, 135, 0, 0.2)",
  },
  moving: {
    icon: "arrow-right-circle-outline",
    textColor: colors.accent,
    bgColor: "rgba(53, 91, 228, 0.2)",
  },
  completed: {
    icon: "check-circle-outline",
    textColor: "#0C6A2A",
    bgColor: "rgba(12, 106, 42, 0.15)",
  },
  canceled: {
    icon: "close-circle-outline",
    textColor: "#7A1F1F",
    bgColor: "rgba(122, 31, 31, 0.15)",
  },
  distance: {
    icon: "source-branch",
    textColor: colors.muted,
    bgColor: colors.backgroundOnTop,
    borderColor: colors.border,
  },
};

const DEFAULT_LABELS = {
  pickup: "Pick up",
  dropoff: "Drop off",
  planned: "Planned",
  moving: "Moving",
  completed: "Completed",
  canceled: "Canceled",
  distance: "16km",
};

const Tag = ({ variant = "moving", label, distance, style }) => {
  const cfg = VARIANTS[variant] || VARIANTS.moving;
  const text =
    label ??
    (variant === "distance"
      ? distance ?? DEFAULT_LABELS.distance
      : DEFAULT_LABELS[variant]);

  const isDistance = variant === "distance";

  return (
    <View
      style={[
        styles.tagWrap,
        {
          backgroundColor: cfg.bgColor,
          paddingVertical: isDistance ? 8 : 4,
          paddingHorizontal: isDistance ? 8 : 8,
          borderWidth: isDistance ? 1 : 0,
          borderColor: isDistance ? cfg.borderColor : "transparent",
        },
        style,
      ]}
    >
      <MaterialCommunityIcons name={cfg.icon} size={16} color={cfg.textColor} />
      <ThemedText style={[styles.tagText, { color: cfg.textColor }]}>
        {text}
      </ThemedText>
    </View>
  );
};

export default Tag;

const styles = StyleSheet.create({
  tagWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
