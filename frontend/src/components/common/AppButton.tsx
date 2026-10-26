/* BOTÓN REUTILIZABLE */

import { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useButtonAnimation } from "../../hooks/useButtonAnimation";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "warning"
  | "outline";

type AppButtonProps = {
  title: string;
  accessibilityLabel?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const getVariantColors = (variant: ButtonVariant) => {
  switch (variant) {
    case "warning":
      return {
        background: colors.warning,
        text: colors.textOnPrimary,
        border: colors.warning,
      };

    case "secondary":
      return {
        background: colors.primaryLight,
        text: colors.primary,
        border: colors.primaryLight,
      };

    case "danger":
      return {
        background: colors.error,
        text: colors.textOnPrimary,
        border: colors.error,
      };

    case "outline":
      return {
        background: colors.background,
        text: colors.primary,
        border: colors.primary,
      };

    default:
      return {
        background: colors.primary,
        text: colors.textOnPrimary,
        border: colors.primary,
      };
  }
};

export const AppButton = ({
  title,
  accessibilityLabel,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: AppButtonProps) => {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;
  const progress = useButtonAnimation(isDisabled);
  const variantColors = getVariantColors(variant);

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.disabledBackground, variantColors.background],
  });

  const textColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.disabledText, variantColors.text],
  });

  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.disabled, variantColors.border],
  });

  const handlePress = () => {
    if (!isDisabled) onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
        },
        fullWidth && styles.fullWidth,
        pressed &&
          !isDisabled && {
            opacity: 0.85,
            ...(variant === "primary" && { backgroundColor: colors.primaryPressed }),
          },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isDisabled ? colors.disabledText : variantColors.text}
        />
      ) : (
        <Animated.Text
          style={[
            styles.text,
            { color: textColor },
            textStyle,
          ]}
        >
          {title}
        </Animated.Text>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    fontSize: typography.size.button,
    fontWeight: typography.weight.semibold,
    textAlign: "center",
  },
});
