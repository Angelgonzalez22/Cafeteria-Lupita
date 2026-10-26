/* CONTROL COMPACTO DE CANTIDADES */

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { radius } from "../../constants/spacing";
import { typography } from "../../constants/typography";

type QuantityStepperProps = {
  value: number;
  label: string;
  disabled?: boolean;
  compact?: boolean;
  onChange: (delta: number) => void;
};

export const QuantityStepper = ({ value, label, disabled, compact = false, onChange }: QuantityStepperProps) => {
  const cannotRemove = disabled || value === 0;
  const cannotAdd = disabled || value >= 2147483647;

  return (
    <View style={[styles.control, compact && styles.compact]}>
      <Pressable
        onPress={() => onChange(-1)}
        disabled={cannotRemove}
        accessibilityRole="button"
        accessibilityLabel={`Quitar uno de ${label}`}
        accessibilityState={{ disabled: cannotRemove }}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <View style={[compact && styles.minusCircle, compact && cannotRemove && styles.disabledMinusCircle]}>
          <Ionicons
            name="remove"
            size={16}
            color={cannotRemove ? colors.disabled : colors.error}
          />
        </View>
      </Pressable>
      <Text
        accessibilityLabel={`${value} unidades de ${label}`}
        accessibilityLiveRegion="polite"
        style={styles.quantity}
      >
        {value}
      </Text>
      <Pressable
        onPress={() => onChange(1)}
        disabled={cannotAdd}
        accessibilityRole="button"
        accessibilityLabel={`Agregar uno de ${label}`}
        accessibilityState={{ disabled: cannotAdd }}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <View style={[compact && styles.plusCircle, compact && cannotAdd && styles.disabledCircle]}>
          <Ionicons
            name="add"
            size={16}
            color={compact ? colors.textOnPrimary : cannotAdd ? colors.disabled : colors.success}
          />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  compact: {
    width: "100%",
    justifyContent: "space-between",
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  minusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.errorLight,
    backgroundColor: colors.errorLight,
    alignItems: "center",
    justifyContent: "center",
  },
  plusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledCircle: {
    backgroundColor: colors.disabled,
  },
  disabledMinusCircle: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  control: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignSelf: "flex-start",
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  quantity: {
    minWidth: 24,
    color: colors.text,
    textAlign: "center",
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  pressed: {
    opacity: 0.5,
  },
});
