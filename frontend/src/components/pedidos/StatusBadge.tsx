/* ESTADO VISUAL DEL PEDIDO */

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import type { EstadoPago, EstadoPreparacion } from "../../models/pedidos/pedido";

type StatusBadgeProps = {
  status: EstadoPreparacion | EstadoPago;
  payment?: boolean;
  compact?: boolean;
};

const labels = {
  PENDIENTE: "Pendiente",
  PREPARANDO: "Preparando",
  LISTO: "Listo",
  PAGADO: "Pagado",
};

export const StatusBadge = ({ status, payment = false, compact = false }: StatusBadgeProps) => {
  const success = status === "LISTO" || status === "PAGADO";
  const preparing = status === "PREPARANDO";
  const backgroundColor = success
    ? colors.successLight
    : preparing ? colors.primaryLight : colors.warningLight;
  const color = success
    ? colors.success
    : preparing ? colors.primary : colors.warning;
  const label = status === "PENDIENTE"
    ? (payment ? "Sin pagar" : "Por preparar")
    : labels[status];
  const icon = status === "PAGADO" ? "checkmark-circle-outline"
    : status === "LISTO" ? "checkmark-done-outline"
      : preparing ? "restaurant-outline"
        : payment ? "wallet-outline" : "time-outline";

  return (
    <View
      accessibilityLabel={label}
      style={[styles.badge, compact && styles.compactBadge, { backgroundColor, borderColor: color + "25" }]}
    >
      <Ionicons
        name={icon}
        size={compact ? 11 : 13}
        color={color}
      />
      <Text style={[styles.text, compact && styles.compactText, { color }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  compactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  compactText: {
    fontSize: 10,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: radius.sm,
  },

  text: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
});
