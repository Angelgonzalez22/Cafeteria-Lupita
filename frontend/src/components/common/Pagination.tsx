/* PAGINACIÓN NUMERADA COMPARTIDA */

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PaginationMetadata } from "../../models/common/pagination";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

type PaginationProps = {
  pagination?: PaginationMetadata;
  page: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  disabled?: boolean;
};

export const Pagination = ({ pagination, page, onPageChange, loading = false, disabled = false }: PaginationProps) => {
  if (!pagination || pagination.totalPages < 1) return null;

  const total = pagination.totalPages;
  const start = Math.max(1, Math.min(page - 1, total - 2));
  const pages = Array.from({ length: Math.min(3, total) }, (_, index) => start + index);
  const blocked = loading || disabled;
  const previousDisabled = blocked || page <= 1;
  const nextDisabled = blocked || page >= total;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={() => onPageChange(page - 1)}
          disabled={previousDisabled}
          accessibilityRole="button"
          accessibilityLabel="Página anterior"
          accessibilityState={{ disabled: previousDisabled }}
          style={styles.target}
        >
          <Ionicons name="chevron-back" size={19} color={previousDisabled ? colors.disabled : colors.textSecondary} />
        </Pressable>
        {pages.map((number) => (
          <Pressable
            key={number}
            onPress={() => onPageChange(number)}
            disabled={blocked || number === page}
            accessibilityRole="button"
            accessibilityLabel={`Página ${number} de ${total}`}
            accessibilityState={{ selected: number === page, disabled: blocked }}
            style={styles.target}
          >
            <View style={[styles.circle, number === page && styles.selected]}>
              <Text style={[styles.number, number === page && styles.selectedText]}>{number}</Text>
            </View>
          </Pressable>
        ))}
        <Pressable
          onPress={() => onPageChange(page + 1)}
          disabled={nextDisabled}
          accessibilityRole="button"
          accessibilityLabel="Página siguiente"
          accessibilityState={{ disabled: nextDisabled }}
          style={styles.target}
        >
          <Ionicons name="chevron-forward" size={19} color={nextDisabled ? colors.disabled : colors.textSecondary} />
        </Pressable>
      </View>
      <View style={styles.status}>
        <Text style={styles.caption} accessibilityLiveRegion="polite">Página {page} de {total}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  target: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    minWidth: 32,
    minHeight: 32,
    paddingHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  number: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
    fontVariant: ["tabular-nums"],
  },
  selectedText: {
    color: colors.textOnPrimary,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 20,
  },
  caption: {
    color: colors.textMuted,
    fontSize: typography.size.caption - 1,
  },
});
