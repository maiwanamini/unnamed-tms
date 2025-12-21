import React from "react";
import { StyleSheet, Text } from "react-native";

export function ThemedText({ style, type = "default", children, ...rest }) {
  const typeStyle =
    type === "title"
      ? styles.title
      : type === "defaultSemiBold"
      ? styles.defaultSemiBold
      : type === "subtitle"
      ? styles.subtitle
      : type === "link"
      ? styles.link
      : styles.default;

  return (
    <Text style={[typeStyle, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    lineHeight: 26,
    fontFamily: "InstrumentSerif_400Regular",
  },
  subtitle: {
    fontSize: 20,
    fontFamily: "InstrumentSerif_400Regular",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    // no theme-based color here; allow overriding via `style`
  },
});
