/* BUSCADOR COMPACTO REUTILIZABLE */

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Skeleton, SkeletonBlock } from "./Skeleton";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  placeholder?: string;
  loading?: boolean;
};

export const SearchInput = ({
  value,
  onChangeText,
  label = "Buscar producto",
  placeholder = "Café, empanada, emparedado…",
  loading = false,
}: SearchInputProps) => {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={styles.field}
        accessibilityState={{ busy: loading }}
      >
        <Ionicons
          name="search-outline"
          size={17}
          color={colors.textSecondary}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          accessibilityLabel={label}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          maxLength={120}
          autoCorrect={false}
          returnKeyType="search"
          style={styles.input}
        />
        {!!value && (
          <Pressable
            onPress={() => onChangeText("")}
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda"
            style={styles.clear}
          >
            <Ionicons
              name="close-circle"
              size={17}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {loading && (
        <View style={styles.searchStatus}>
          <Skeleton
            style={styles.dots}
            label="Buscando productos"
          >
            <SkeletonBlock style={styles.dot} />
            <SkeletonBlock style={styles.dot} />
            <SkeletonBlock style={styles.dot} />
          </Skeleton>
          <Text
            style={styles.searchText}
            accessibilityLiveRegion="polite"
          >
            Buscando productos…
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  searchStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 22,
  },
  searchText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },
  group: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
    color: colors.text,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.size.button,
    color: colors.text,
  },
  clear: {
    width: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
