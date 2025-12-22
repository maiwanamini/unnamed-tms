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
      : type === "h2"
      ? styles.h2
      : type === "small"
      ? styles.small
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
    fontSize: 16,
    lineHeight: 28,
    fontWeight: "600",
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 24,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 20,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    // no theme-based color here; allow overriding via `style`
  },
});
