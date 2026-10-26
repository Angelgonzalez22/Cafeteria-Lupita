/* FILTROS REUTILIZABLES DE SELECCIÓN */

import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import type { FilterOption } from "../../models/common/filter";

type FilterChipsProps<T extends string> = {
  options: readonly FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  inline?: boolean;
};

export const FilterChips = <T extends string>({
  options,
  value,
  onChange,
  inline = false,
}: FilterChipsProps<T>) => {
  return (
    <View style={[styles.row, inline && styles.inline]}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityState={{ selected: option.value === value }}
          style={[
            styles.chip,
            option.value === value && styles.selected,
          ]}
        >
          <Text style={[
            styles.text,
            option.value === value && styles.selectedText,
          ]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  inline: {
    flexWrap: "nowrap",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  chip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },

  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  text: {
    color: colors.textSecondary,
    fontSize: typography.size.caption - 1,
    fontWeight: typography.weight.medium,
  },

  selectedText: {
    color: colors.textOnPrimary,
  },
});
