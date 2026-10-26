/* PROGRESO VISUAL DE PREPARACIÓN Y PAGO */

import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { EstadoPago, EstadoPreparacion } from "../../models/pedidos/pedido";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

type StatusStep = {
  value: string;
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
};

type OrderStatusStepsProps = {
  preparation: EstadoPreparacion;
  payment?: EstadoPago;
  inactive?: boolean;
};

const preparationSteps: readonly StatusStep[] = [
  { value: "PENDIENTE", label: "Pendiente", icon: "receipt-outline" },
  { value: "PREPARANDO", label: "Preparando", icon: "restaurant-outline" },
  { value: "LISTO", label: "Listo", icon: "checkmark-done-outline" },
];

const paymentSteps: readonly StatusStep[] = [
  { value: "PENDIENTE", label: "Sin pagar", icon: "wallet-outline" },
  { value: "PAGADO", label: "Pagado", icon: "checkmark-outline" },
];

const StatusTrack = ({ title, steps, value, inactive }: {
  title: string;
  steps: readonly StatusStep[];
  value: string;
  inactive: boolean;
}) => {
  const current = steps.findIndex((step) => step.value === value);

  return (
    <View
      accessible
      accessibilityLabel={`${title}: ${steps[current]?.label ?? value}${inactive ? ", pedido inactivo" : ""}`}
      style={styles.track}
    >
      <Text style={styles.title}>{title}</Text>
      <View style={styles.steps}>
        {steps.map((step, index) => {
          const active = index === current && !inactive;
          const completed = index < current && !inactive;

          return (
            <View key={step.value} style={styles.step}>
              <View style={styles.nodeRow}>
                <View style={[
                  styles.line,
                  !inactive && index <= current && styles.completedLine,
                  index === 0 && styles.hiddenLine,
                ]} />
                <View style={[styles.node, completed && styles.completedNode, active && styles.activeNode]}>
                  <Ionicons
                    name={completed ? "checkmark" : step.icon}
                    size={15}
                    color={active ? colors.textOnPrimary : completed ? colors.primary : colors.textMuted}
                  />
                </View>
                <View style={[
                  styles.line,
                  !inactive && index < current && styles.completedLine,
                  index === steps.length - 1 && styles.hiddenLine,
                ]} />
              </View>
              <Text style={[styles.label, completed && styles.completedLabel, active && styles.activeLabel]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const OrderStatusSteps = ({ preparation, payment, inactive = false }: OrderStatusStepsProps) => {
  return (
    <View style={styles.container}>
      <StatusTrack
        title="Estado del pedido"
        steps={preparationSteps}
        value={preparation}
        inactive={inactive}
      />
      {payment && (
        <StatusTrack
          title="Estado de pago"
          steps={paymentSteps}
          value={payment}
          inactive={inactive}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  track: {
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  steps: {
    flexDirection: "row",
  },
  step: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
  nodeRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
  },
  completedLine: {
    backgroundColor: colors.primary,
  },
  hiddenLine: {
    backgroundColor: "transparent",
  },
  node: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  completedNode: {
    backgroundColor: colors.primaryLight,
  },
  activeNode: {
    backgroundColor: colors.primary,
  },
  label: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: typography.size.caption - 1,
    paddingHorizontal: spacing.xs,
  },
  completedLabel: {
    color: colors.textSecondary,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: typography.weight.semibold,
  },
});
