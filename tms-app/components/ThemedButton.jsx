import React from "react";
import {
  StyleSheet,
  Pressable,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

/**
 * Button
 * Props:
 * - text: string (button label)
 * - onPress: function
 * - variant: 'primary' | 'outline' | 'ghost' (default: 'primary')
 * - size: 'small' | 'default' (default: 'default')
 * - icon: React element (optional)
 * - iconPosition: 'leading' | 'trailing' (default: 'leading')
 * - disabled: boolean
 * - loading: boolean
 * - style, textStyle, iconStyle: style overrides
 */

export function ThemedButton({
  text,
  children,
  onPress,
  variant = "primary",
  size = "default",
  icon,
  iconPosition = "leading",
  disabled = false,
  loading = false,
  style,
  textStyle,
  iconStyle,
  ...rest
}) {
  const isDisabled = disabled || loading;

  const containerStyle = ({ pressed }) => {
    const base = [
      styles.base,
      size === "small" ? styles.small : styles.defaultSize,
    ];

    // Variant styles
    if (variant === "primary") {
      base.push(styles.primary);
      if (isDisabled) base.push(styles.primaryDisabled);
      if (pressed && !isDisabled) base.push(styles.primaryPressed);
    } else if (variant === "outline") {
      base.push(styles.outline);
      if (isDisabled) base.push(styles.outlineDisabled);
      if (pressed && !isDisabled) base.push(styles.outlinePressed);
    } else if (variant === "ghost") {
      base.push(styles.ghost);
      if (isDisabled) base.push(styles.ghostDisabled);
      if (pressed && !isDisabled) base.push(styles.ghostPressed);
    } else if (variant === "twoLines") {
      // twoLines behaves like ghost visually, but the label is gray and allows two lines
      base.push(styles.ghost);
      // apply a smaller vertical padding for twoLines
      base.push(styles.twoLines);
      if (isDisabled) base.push(styles.ghostDisabled);
      if (pressed && !isDisabled) base.push(styles.ghostPressed);
    }

    return [...base, style];
  };

  const renderContent = () => (
    <View style={styles.content} pointerEvents="none">
      {loading ? (
        <ActivityIndicator
          size={size === "small" ? "small" : "small"}
          color={variant === "primary" ? colors.backgroundOnTop : colors.accent}
          style={styles.spinner}
        />
      ) : null}

      {icon && iconPosition === "leading" && !loading ? (
        <View style={[styles.iconWrapper, iconStyle]}>{icon}</View>
      ) : null}

      <Text
        style={[
          styles.label,
          size === "small" ? styles.labelSmall : styles.labelDefault,
          variant === "primary"
            ? styles.labelPrimary
            : variant === "twoLines"
            ? styles.labelTwoLines
            : styles.labelSecondary,
          textStyle,
        ]}
        numberOfLines={variant === "twoLines" ? 2 : 1}
      >
        {children != null ? children : text}
      </Text>

      {icon && iconPosition === "trailing" && !loading ? (
        <View style={[styles.iconWrapper, iconStyle]}>{icon}</View>
      ) : null}
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={containerStyle}
      accessibilityRole="button"
      {...rest}
    >
      {renderContent()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: spacing.borderRadiusButton,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  defaultSize: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  primaryPressed: {
    backgroundColor: "#2b4fd1",
  },
  primaryDisabled: {
    backgroundColor: "#b7c7f7",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  outlinePressed: {
    backgroundColor: "rgba(53,91,228,0.08)",
  },
  outlineDisabled: {
    borderColor: "#e6edf9",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  ghostPressed: {
    backgroundColor: "rgba(31, 31, 31, 0.04)",
  },
  ghostDisabled: {},
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    marginHorizontal: 8,
    alignSelf: "center",
  },
  label: {
    textAlign: "center",
    flexShrink: 1,
  },
  labelDefault: {
    fontSize: 16,
    lineHeight: 20,
  },
  labelSmall: {
    fontSize: 14,
    lineHeight: 18,
  },
  labelPrimary: {
    color: colors.backgroundOnTop,
  },
  labelSecondary: {
    color: colors.accent,
  },
  labelTwoLines: {
    color: "#6b7280",
    lineHeight: 16,
  },
  twoLines: {
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  spinner: {
    marginRight: 8,
  },
});
