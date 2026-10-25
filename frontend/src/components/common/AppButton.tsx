/* BOTÓN REUTILIZABLE */

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
} from "react-native";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "outline";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const getVariantColors = (variant: ButtonVariant) => {
  switch (variant) {
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
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: AppButtonProps) => {
  const isDisabled = disabled || loading;
  const variantColors = getVariantColors(variant);

  const backgroundColor = isDisabled
    ? colors.disabledBackground
    : variantColors.background;

  const textColor = isDisabled
    ? colors.disabledText
    : variantColors.text;

  const borderColor = isDisabled
    ? colors.disabled
    : variantColors.border;

  const handlePress = () => {
    if (!isDisabled) onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      style={({ pressed }) => [
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
          color={textColor}
        />
      ) : (
        <Text
          style={[
            styles.text,
            { color: textColor },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
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
