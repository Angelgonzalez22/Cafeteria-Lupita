/* TARJETA REUTILIZABLE DE PEDIDOS */

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../common/AppButton";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import type { HomeOrder } from "../../models/home/home";
import { formatCurrency, formatOrderTime } from "../../utils/format";
import { StatusBadge } from "./StatusBadge";
import { orderLabel } from "../../utils/order";

type OrderCardProps = {
  order: HomeOrder;
  showEmployee?: boolean;
  compact?: boolean;
  kitchenPreview?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onView?: () => void;
  onPreparation: (id: string, action: "iniciar" | "finalizar") => void;
};

export const OrderCard = ({
  order,
  showEmployee = false,
  compact = false,
  kitchenPreview = false,
  loading = false,
  disabled = false,
  onView,
  onPreparation,
}: OrderCardProps) => {
  const kitchen = order.kind === "kitchen";
  const canStart = !order.cancelado && !order.eliminado && order.estadoPreparacion === "PENDIENTE";
  const canFinish = !order.cancelado && !order.eliminado && order.estadoPreparacion === "PREPARANDO";

  const renderCompactHeader = () => (
    <View style={[styles.header, !!onView && styles.linkedHeader]}>
      <View style={styles.orderIcon}>
        <Ionicons
          name={kitchen ? "restaurant-outline" : "receipt-outline"}
          size={18}
          color={colors.primary}
        />
      </View>
      <View style={styles.identity}>
        <Text style={styles.orderNumber}>{orderLabel(order)}</Text>
        {order.kind === "sale" && order.syncStatus && order.syncStatus !== "sincronizado" && (
          <Text style={styles.caption}>{order.syncStatus === "conflicto" ? "Requiere revisión" : "Pendiente de enviar"}</Text>
        )}
        <Text style={styles.compactCustomer}>{order.cliente}</Text>
      </View>
      <View style={[styles.amount, styles.compactAmount]}>
        {order.kind === "sale" && (
          <Text style={styles.compactTotal}>{formatCurrency(order.total)}</Text>
        )}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.identity}>
        <Text style={styles.title}>
          {orderLabel(order)}
        </Text>

        <Text style={styles.customer}>
          {order.cliente}
        </Text>

        {order.kind === "sale" && showEmployee && (
          <Text style={styles.caption}>
            Atendió: {order.atendidoPor}
          </Text>
        )}
      </View>

      <View style={styles.amount}>
        <Text style={styles.caption}>
          {formatOrderTime(order.creadoEn)}
        </Text>

        {order.kind === "sale" && (
          <Text style={styles.total}>
            {formatCurrency(order.total)}
          </Text>
        )}
      </View>
    </View>
  );

  const renderProducts = () => {
    if (order.kind !== "kitchen") {
      return null;
    }

    if (kitchenPreview) {
      return (
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={styles.productPreview}
        >
          {order.detalles.map((product) => `${product.cantidad}× ${product.producto}`).join(" · ")}
        </Text>
      );
    }

    return (
      <View style={styles.products}>
        {order.detalles.map((product) => (
          <View
            key={product.productoId}
            style={styles.product}
          >
            <Text style={styles.quantity}>
              {product.cantidad}×
            </Text>

            <Text style={styles.productName}>
              {product.producto}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderStatuses = () => (
    <View style={styles.statuses}>
      <StatusBadge
        status={order.estadoPreparacion}
        compact={compact}
      />

      {order.kind === "sale" && (
        <StatusBadge
          status={order.estadoPago}
          payment
          compact={compact}
        />
      )}
    </View>
  );

  const renderAction = () => {
    if (kitchen && (canStart || canFinish)) {
      return (
        <AppButton
          title={canStart ? "Comenzar" : "Marcar listo"}
          onPress={() => onPreparation(order.id, canStart ? "iniciar" : "finalizar")}
          loading={loading}
          disabled={disabled}
          variant={kitchenPreview ? "secondary" : "primary"}
          style={[styles.prepareButton, kitchenPreview && styles.previewAction]}
        />
      );
    }

    if (kitchen || !onView) {
      return null;
    }

    return (
      <Pressable
        onPress={onView}
        accessibilityRole="button"
        accessibilityLabel={"Ver " + orderLabel(order)}
        style={styles.viewButton}
      >
        <Text style={styles.link}>
          {compact ? "Detalle" : "Ver pedido"}
        </Text>

        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.primary}
          accessible={false}
        />
      </Pressable>
    );
  };

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      {compact && onView ? (
        <Pressable
          onPress={onView}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalle de ${orderLabel(order)}, ${order.cliente}`}
          style={({ pressed }) => [styles.headerLink, pressed && styles.pressed]}
        >
          {renderCompactHeader()}
          <View style={styles.detailArrow}>
            <Ionicons
              name="chevron-forward"
              size={15}
              color={colors.primary}
            />
          </View>
        </Pressable>
      ) : compact ? renderCompactHeader() : renderHeader()}
      {compact && showEmployee && order.kind === "sale" && (
        <View style={styles.employee}>
          <Ionicons
            name="person-outline"
            size={12}
            color={colors.textMuted}
          />
          <Text style={styles.employeeText}>Atendió: {order.atendidoPor}</Text>
        </View>
      )}
      {renderProducts()}
      {kitchen && kitchenPreview ? (
        <View style={styles.previewFooter}>
          <View style={styles.previewInfo}>
            {renderStatuses()}
            <Text style={styles.footerTime}>{formatOrderTime(order.creadoEn)}</Text>
          </View>
          {renderAction()}
        </View>
      ) : compact ? (
        <>
          <View style={styles.compactFooter}>
            {renderStatuses()}
            <View style={styles.footerMeta}>
              <Text style={styles.footerTime}>{formatOrderTime(order.creadoEn)}</Text>
            </View>
          </View>
          {kitchen && renderAction()}
        </>
      ) : (
        <>
          {renderStatuses()}
          {renderAction()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  productPreview: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: 18,
  },
  previewFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  previewInfo: {
    gap: spacing.xs,
    alignItems: "flex-start",
  },
  previewAction: {
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  compactAmount: {
    alignSelf: "center",
  },
  linkedHeader: {
    flex: 1,
  },
  headerLink: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    gap: spacing.sm,
  },
  detailArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  employee: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  employeeText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.size.caption - 1,
  },
  pressed: {
    opacity: 0.65,
  },
  compactFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  footerMeta: {
    alignItems: "flex-end",
  },
  footerTime: {
    color: colors.textSecondary,
    fontSize: typography.size.caption - 1,
    fontVariant: ["tabular-nums"],
    textAlign: "right",
  },
  compactCard: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.md,
  },

  orderIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
  },

  orderNumber: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },

  compactCustomer: {
    color: colors.text,
    fontSize: typography.size.button - 1,
    fontWeight: typography.weight.semibold,
  },

  compactTotal: {
    color: colors.primary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    fontVariant: ["tabular-nums"],
  },

  card: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },

  identity: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },

  title: {
    color: colors.text,
    fontSize: typography.size.button,
    fontWeight: typography.weight.semibold,
  },

  customer: {
    color: colors.textSecondary,
    fontSize: typography.size.button,
  },

  caption: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  amount: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },

  total: {
    color: colors.text,
    fontSize: typography.size.button,
    fontWeight: typography.weight.semibold,
  },

  statuses: {
    flexShrink: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  products: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },

  product: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  quantity: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.divider,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },

  productName: {
    flex: 1,
    color: colors.text,
    fontSize: typography.size.button,
    paddingTop: spacing.xs,
  },

  prepareButton: {
    alignSelf: "flex-end",
  },

  viewButton: {
    minHeight: 44,
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  link: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },
});
