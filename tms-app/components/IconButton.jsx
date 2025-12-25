import React from "react";
import { Pressable, View, ActivityIndicator, StyleSheet } from "react-native";
import { Linking } from "react-native";
import colors from "../theme/colors";

/**
 * IconButton
 * Props:
 * - icon: React element (required)
 * - onPress: function
 * - href: string (optional) - if provided and no onPress, will open the URL
 * - accessibilityLabel: string
 * - size: 'small' | 'default' (default: 'default')
 * - variant: 'ghost' | 'solid' | 'outline' (default: 'ghost')
 * - disabled: boolean
 * - loading: boolean
 * - style, iconStyle: style overrides
 */

export default function IconButton({
  icon,
  onPress,
  href,
  accessibilityLabel,
  size = "default",
  variant = "ghost",
  disabled = false,
  loading = false,
  style,
  iconStyle,
  ...rest
}) {
  const isDisabled = disabled || loading;

  const handlePress = async () => {
    if (isDisabled) return;
    if (onPress) return onPress();
    if (href) {
      try {
        await Linking.openURL(href);
      } catch (e) {
        console.warn("Unable to open URL:", href, e);
      }
    }
  };

  const sizeStyle = size === "small" ? styles.small : styles.defaultSize;

  const containerStyle = ({ pressed }) => {
    const base = [styles.base, sizeStyle, style];

    if (variant === "solid") {
      base.push(styles.solid);
      if (pressed && !isDisabled) base.push(styles.solidPressed);
      if (isDisabled) base.push(styles.solidDisabled);
    } else if (variant === "outline") {
      base.push(styles.outline);
      if (pressed && !isDisabled) base.push(styles.outlinePressed);
      if (isDisabled) base.push(styles.outlineDisabled);
    } else {
      // ghost
      base.push(styles.ghost);
      if (pressed && !isDisabled) base.push(styles.ghostPressed);
      if (isDisabled) base.push(styles.ghostDisabled);
    }

    return base;
  };

  const renderIcon = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={size === "small" ? "small" : "small"}
          color={variant === "solid" ? colors.backgroundOnTop : colors.accent}
        />
      );
    }

    // If the caller passed an icon element, allow overriding its color/size there.
    return <View style={[styles.iconWrapper, iconStyle]}>{icon}</View>;
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      {...rest}
    >
      {renderIcon()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultSize: {
    width: 40,
    height: 40,
  },
  small: {
    width: 32,
    height: 32,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  ghostPressed: {
    backgroundColor: "rgba(53,91,228,0.06)",
  },
  ghostDisabled: {
    opacity: 0.5,
  },
  solid: {
    backgroundColor: colors.accent,
  },
  solidPressed: {
    backgroundColor: "#2b4fd1",
  },
  solidDisabled: {
    backgroundColor: "#b7c7f7",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  outlinePressed: {
    backgroundColor: "rgba(53,91,228,0.06)",
  },
  outlineDisabled: {
    borderColor: "#e6edf9",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
