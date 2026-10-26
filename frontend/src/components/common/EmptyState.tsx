/* ESTADO VACÍO REUTILIZABLE */

import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { AppButton } from "./AppButton";
import { LoadingSkeleton } from "./LoadingSkeleton";

type EmptyStateProps = {
  title: string;
  message: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
  actionTitle?: string;
  onAction?: () => void;
  loading?: boolean;
};

export const EmptyState = ({
  title,
  message,
  icon = "receipt-outline",
  actionTitle = "Reintentar",
  onAction,
  loading = false,
}: EmptyStateProps) => {
  if (loading) return <LoadingSkeleton count={2} />;

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons
          name={icon}
          size={36}
          color={colors.primary}
          accessible={false}
        />
      </View>

      <Text
        accessibilityRole="header"
        style={styles.title}
      >
        {title}
      </Text>

      <Text style={styles.message}>
        {message}
      </Text>

      {onAction && (
        <AppButton
          title={actionTitle}
          onPress={onAction}
          loading={loading}
          variant="outline"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },

  icon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.sm,
  },

  title: {
    color: colors.text,
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    textAlign: "center",
  },

  message: {
    maxWidth: 340,
    color: colors.textSecondary,
    fontSize: typography.size.button,
    lineHeight: 22,
    textAlign: "center",
  },
});
