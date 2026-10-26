/* TARJETA REUTILIZABLE DE RESUMEN */

import { StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Skeleton, SkeletonBlock } from "../common/Skeleton";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

type SummaryCardProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  highlighted?: boolean;
  loading?: boolean;
  compact?: boolean;
  icon?: ComponentProps<typeof Ionicons>["name"];
  style?: StyleProp<ViewStyle>;
};

export const SummaryCard = ({
  label,
  value,
  subtitle,
  highlighted = false,
  loading = false,
  compact = false,
  icon,
  style,
}: SummaryCardProps) => {
  return (
    <View
      style={[styles.card, highlighted && styles.highlighted, compact && styles.compact, style]}
      accessibilityLabel={loading ? label + ", cargando" : label + ", " + value}
    >
      <View style={styles.heading}>
        {icon && <Ionicons
          name={icon}
          size={16}
          color={highlighted ? colors.primary : colors.textSecondary}
        />}
        <Text style={styles.label}>{label}</Text>
      </View>

      {loading ? (
        <Skeleton
          label={`${label}, cargando`}
          style={styles.loading}
        >
          <SkeletonBlock style={styles.valuePlaceholder} />
        </Skeleton>
      ) : (
        <Text style={[styles.value, highlighted && styles.primaryValue, compact && styles.compactValue]}>
          {value}
        </Text>
      )}

      {!!subtitle && !loading && (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  valuePlaceholder: {
    width: "65%",
    height: 25,
  },
  card: {
    width: "100%",
    minWidth: 0,
    gap: spacing.sm,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  highlighted: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.primaryLight,
  },

  compact: {
    padding: spacing.md,
    gap: spacing.xs,
  },

  compactValue: {
    fontSize: typography.size.title - spacing.xs,
  },

  label: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  value: {
    color: colors.text,
    fontSize: typography.size.title,
    fontWeight: typography.weight.semibold,
  },

  primaryValue: {
    color: colors.primary,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  loading: {
    width: "100%",
    minHeight: 29,
  },
});
