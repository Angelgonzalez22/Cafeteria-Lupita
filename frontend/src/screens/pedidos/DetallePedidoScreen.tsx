/* DETALLE Y ACCIONES DEL PEDIDO SEGÚN SU ESTADO */

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SkeletonRefreshControl } from "../../components/common/SkeletonRefreshControl";
import { AppButton } from "../../components/common/AppButton";
import { EmptyState } from "../../components/common/EmptyState";
import { OrderDetailSkeleton } from "../../components/pedidos/OrderDetailSkeleton";
import { ScreenWrapper } from "../../components/layout/ScreenWrapper";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { AppModal } from "../../components/modals/AppModal";
import { OrderStatusSteps } from "../../components/pedidos/OrderStatusSteps";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { usePedido } from "../../hooks/pedidos/usePedido";
import { useResponsive } from "../../hooks/useResponsive";
import type { RootStackParamList } from "../../models/auth/navigation";
import type { DetallePedidoResponse } from "../../models/pedidos/pedido";
import type { CocinaProductoResponse } from "../../models/cocina/cocina";
import { formatCurrency, formatOrderTime } from "../../utils/format";
import { formatSelectedDay } from "../../utils/date";
import { orderLabel } from "../../utils/order";

type Props = NativeStackScreenProps<RootStackParamList, "DetallePedido">;

export const DetallePedidoScreen = ({ navigation, route }: Props) => {
  const detalle = usePedido(route.params.id);
  const { horizontalPadding, maxContentWidth } = useResponsive();
  const vista = detalle.vista;
  const pedido = vista?.pedido;
  const kitchen = detalle.kitchen;
  const canceled = vista?.kind === "sale" ? !!vista.pedido.canceladoEn : !!vista?.pedido.cancelado;
  const deleted = vista?.kind === "kitchen" && vista.pedido.eliminado;
  const units = pedido?.detalles.reduce((sum, item) => sum + item.cantidad, 0) ?? 0;

  const renderError = () => detalle.error ? (
    <EmptyState
      title={detalle.error.titulo}
      message={detalle.error.mensaje}
      onAction={detalle.refresh}
      loading={detalle.refreshing}
      icon="cloud-offline-outline"
    />
  ) : null;

  const renderHeader = () => {
    if (detalle.loading || !pedido) return null;

    return (
      <View style={styles.overview}>
        {vista?.kind === "sale" && vista.pedido.syncStatus === "conflicto" && (
          <Text style={styles.warningText}>Requiere revisión: {vista.pedido.syncMessage}</Text>
        )}
        <View style={styles.customerCard}>
          <View style={styles.customerHeading}>
            <View style={styles.identity}>
              <Text style={styles.caption}>{kitchen ? "Comanda" : "Cliente"}</Text>
              <Text style={styles.customerName}>{pedido.cliente}</Text>
            </View>
            <View style={styles.dateBlock}>
              <Text style={styles.dateText}>{formatSelectedDay(pedido.creadoEn.slice(0, 10))}</Text>
              <Text style={styles.dateTime}>{formatOrderTime(pedido.creadoEn)}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.caption}>Atendido por</Text>
            <Text style={styles.metaText}>{pedido.atendidoPor}</Text>
          </View>
          {vista?.kind === "sale" && (
            <View style={styles.metaRow}>
              <Text style={styles.caption}>Referencia</Text>
              <Text style={styles.metaText}>{vista.pedido.referencia}</Text>
            </View>
          )}
        </View>
        <OrderStatusSteps
          preparation={pedido.estadoPreparacion}
          inactive={canceled || deleted}
        />
        {(canceled || deleted) && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>{deleted ? "Pedido eliminado" : "Pedido cancelado"}</Text>
            <Text style={styles.warningText}>
              {vista?.kind === "sale" && vista.pedido.motivoCancelacion
                ? vista.pedido.motivoCancelacion : "Este pedido no admite nuevas operaciones."}
            </Text>
          </View>
        )}
        {renderError()}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Productos</Text>
          <Text style={styles.caption}>{units} unidades</Text>
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.columnLabel, styles.quantityColumn]}>Cant.</Text>
          <Text style={[styles.columnLabel, styles.nameColumn]}>Producto</Text>
          {!kitchen && <Text style={[styles.columnLabel, styles.amountColumn]}>Importe</Text>}
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (detalle.loading || !pedido) return null;

    return (
      <View style={styles.footer}>
        {vista?.kind === "sale" && (
          <View style={styles.totalRow}>
            <Text style={styles.sectionTitle}>Total</Text>
            <Text style={styles.total}>{formatCurrency(vista.pedido.total)}</Text>
          </View>
        )}
        {vista?.kind === "sale" && vista.pedido.estadoPago === "PAGADO" && (
          <View style={styles.paidMessage}>
            <Text style={styles.paidText}>{vista.pedido.syncStatus === "conflicto" ? "Cobro pendiente de revisión"
              : vista.pedido.syncStatus === "pendiente" ? "Cobro guardado, pendiente de enviar" : "Compra completada"}</Text>
          </View>
        )}
        {(detalle.canStart || detalle.canFinish) && (
          <AppButton
            title={detalle.canStart ? "Comenzar preparación" : kitchen ? "Marcar como listo" : "Confirmar listo con cocina"}
            onPress={() => detalle.requestAction(detalle.canStart ? "iniciar" : "finalizar")}
            disabled={!detalle.canAct}
            loading={detalle.busy}
            fullWidth
          />
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (detalle.loading) return <OrderDetailSkeleton kitchen={kitchen} />;
    return renderError();
  };

  const renderPaymentBar = () => {
    if (!detalle.canPay || detalle.loading || vista?.kind !== "sale") return null;

    return (
      <View style={styles.paymentBar}>
        <View style={[styles.paymentContent, { paddingHorizontal: horizontalPadding, maxWidth: Math.min(maxContentWidth, 680) }]}>
          <Text style={styles.paymentHint}>
            {detalle.pendingPayment ? "Reintenta el mismo cobro para confirmar el registro."
              : "Confirma el cobro al recibir el efectivo."}
          </Text>
          <AppButton
            title={detalle.pendingPayment ? "Reintentar cobro" : `Cobrar ${formatCurrency(vista.pedido.total)}`}
            onPress={() => detalle.requestAction("cobrar")}
            disabled={!detalle.canAct}
            loading={detalle.busy}
            fullWidth
          />
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper
      padded={false}
      edges={["bottom"]}
      contentStyle={styles.root}
    >
      <SectionHeader
        title={pedido ? orderLabel(pedido) : "Detalle del pedido"}
        onBack={() => navigation.goBack()}
      />
      <FlatList<DetallePedidoResponse | CocinaProductoResponse>
        data={detalle.loading ? [] : pedido?.detalles ?? []}
        keyExtractor={(item) => item.productoId}
        contentContainerStyle={[styles.list, { paddingHorizontal: horizontalPadding, maxWidth: Math.min(maxContentWidth, 680) }]}
        ListHeaderComponent={renderHeader() ?? undefined}
        ListEmptyComponent={renderEmpty() ?? undefined}
        ListFooterComponent={renderFooter() ?? undefined}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Text style={[styles.quantity, styles.quantityColumn]}>{item.cantidad}</Text>
            <View style={styles.nameColumn}>
              <Text style={styles.productName}>{item.producto}</Text>
              {"precioUnitario" in item && <Text style={styles.caption}>{formatCurrency(item.precioUnitario)} c/u</Text>}
            </View>
            {"subtotal" in item && <Text style={[styles.productAmount, styles.amountColumn]}>{formatCurrency(item.subtotal)}</Text>}
          </View>
        )}
        refreshControl={
          <SkeletonRefreshControl
            onRefresh={detalle.refresh}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      {renderPaymentBar()}
      <AppModal
        visible={!!detalle.confirmation}
        variant="confirmation"
        titulo={detalle.confirmation === "cobrar" ? "Confirmar cobro en efectivo"
          : detalle.confirmation === "iniciar" ? "Comenzar preparación" : "Pedido listo"}
        mensaje={detalle.confirmation === "cobrar"
          ? `Confirma que recibiste ${vista?.kind === "sale" ? formatCurrency(vista.pedido.total) : ""} en efectivo. ${vista?.kind === "sale" && vista.pedido.creadoPor !== undefined && vista.pedido.creadoPor !== detalle.userId ? "Este pedido pertenece a otro usuario; estás asumiendo su cobro como administrador. " : ""}Se registrará el pago.`
          : detalle.confirmation === "iniciar" ? "¿Estás seguro de comenzar a preparar este pedido?"
            : "Confirma que cocina ya terminó todos los productos. Si no hay conexión, avisa a cocina verbalmente o en papel."}
        acceptText={detalle.confirmation === "cobrar" ? "Sí, recibí el efectivo" : "Sí, confirmar"}
        onAccept={() => { void detalle.confirmAction(); }}
        onCancel={detalle.cancelAction}
      />
      <AppModal
        visible={!!detalle.feedback}
        titulo={detalle.feedback?.titulo ?? ""}
        mensaje={detalle.feedback?.mensaje ?? ""}
        status={detalle.feedback?.status}
        onAccept={detalle.dismissFeedback}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  paymentBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  paymentContent: {
    width: "100%",
    alignSelf: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  paymentHint: {
    color: colors.textSecondary,
    fontSize: typography.size.caption - 1,
    textAlign: "center",
  },
  dateBlock: {
    alignItems: "flex-end",
    maxWidth: "45%",
    gap: spacing.xs,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption - 1,
    textAlign: "right",
  },
  dateTime: {
    color: colors.textMuted,
    fontSize: typography.size.caption - 1,
    fontVariant: ["tabular-nums"],
  },
  root: {
    maxWidth: "100%",
  },
  list: {
    width: "100%",
    alignSelf: "center",
    paddingVertical: spacing.base,
  },
  overview: {
    gap: spacing.base,
  },
  customerCard: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  customerHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  identity: {
    flex: 1,
    gap: spacing.xs,
  },
  customerName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: typography.weight.semibold,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  metaText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.size.caption,
    textAlign: "right",
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.size.button,
    fontWeight: typography.weight.semibold,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 0,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  columnLabel: {
    color: colors.textMuted,
    fontSize: typography.size.caption - 1,
    fontWeight: typography.weight.medium,
  },
  quantityColumn: {
    width: 34,
    textAlign: "center",
  },
  nameColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  amountColumn: {
    minWidth: 68,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 0,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  quantity: {
    color: colors.textSecondary,
    fontSize: typography.size.button,
    fontWeight: typography.weight.medium,
  },
  productName: {
    color: colors.text,
    fontSize: typography.size.button,
    fontWeight: typography.weight.medium,
  },
  productAmount: {
    color: colors.text,
    fontSize: typography.size.button,
    fontWeight: typography.weight.semibold,
  },
  footer: {
    gap: spacing.base,
    paddingTop: spacing.base,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  total: {
    color: colors.text,
    fontSize: 24,
    fontWeight: typography.weight.semibold,
    fontVariant: ["tabular-nums"],
  },
  paidMessage: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  paidText: {
    color: colors.success,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
    textAlign: "center",
  },
  warningBox: {
    padding: spacing.md,
    gap: spacing.xs,
    borderLeftWidth: 2,
    borderLeftColor: colors.error,
  },
  warningTitle: {
    color: colors.error,
    fontSize: typography.size.button,
    fontWeight: typography.weight.semibold,
  },
  warningText: {
    color: colors.error,
    fontSize: typography.size.caption,
  },
});
