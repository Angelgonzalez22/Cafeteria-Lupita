/* SELECCIÓN DE PRODUCTOS Y CONFIRMACIÓN DE NUEVA VENTA */

import { useEffect, useRef, useState } from "react";
import { usePreventRemove } from "@react-navigation/native";
import type { NavigationAction } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SkeletonRefreshControl } from "../../components/common/SkeletonRefreshControl";

import { AppButton } from "../../components/common/AppButton";
import { AppInput } from "../../components/common/AppInput";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSkeleton } from "../../components/common/LoadingSkeleton";
import { AppModal } from "../../components/modals/AppModal";
import { SaleModal } from "../../components/modals/SaleModal";
import { ProductCard } from "../../components/productos/ProductCard";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useNuevaVenta } from "../../hooks/pedidos/useNuevaVenta";
import { useProductos } from "../../hooks/productos/useProductos";
import { useModalAnimation } from "../../hooks/useModalAnimation";
import { useResponsive } from "../../hooks/useResponsive";
import { useKeyboardVisible } from "../../hooks/useKeyboardVisible";
import type { RootStackParamList } from "../../models/auth/navigation";
import type { ProductoResponse } from "../../models/productos/producto";
import { formatCurrency } from "../../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "NuevaVenta">;

export const NuevaVentaScreen = ({ navigation }: Props) => {
  const venta = useNuevaVenta();
  const catalogo = useProductos(true, 10);
  const { width, fontScale } = useResponsive();
  const { progress, close } = useModalAnimation();
  const keyboardVisible = useKeyboardVisible();
  const [leaveAction, setLeaveAction] = useState<NavigationAction | null>(null);
  const [confirmPayment, setConfirmPayment] = useState(false);
  const productsList = useRef<FlatList<ProductoResponse>>(null);

  const selecting = venta.step === "productos";
  const columns = width >= 350 && fontScale < 1.4 ? 2 : 1;

  usePreventRemove(!venta.guardado, ({ data }) => {
    if (venta.loading) return;
    if (venta.dirty || venta.pendienteConfirmacion) {
      setLeaveAction(data.action);
      return;
    }

    close(() => navigation.dispatch(data.action));
  });

  useEffect(() => {
    if (venta.guardado) {
      const id = venta.guardado.id;
      close(() => navigation.replace("DetallePedido", { id }));
    }
  }, [navigation, venta.guardado, close]);

  const handleSubmit = (cobrar: boolean) => {
    if (!venta.canSubmit) return;
    if (cobrar && !venta.pendienteConfirmacion) {
      setConfirmPayment(true);
      return;
    }
    void venta.submit(cobrar);
  };

  const handlePageChange = (page: number) => {
    catalogo.goToPage(page);
    productsList.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const handleDiscard = () => {
    const action = leaveAction;
    setLeaveAction(null);
    if (action) close(() => navigation.dispatch(action));
  };

  const renderCount = () => (
    <View
      style={styles.countBadge}
      accessibilityLabel={`${venta.unidades} productos en el pedido`}
    >
      <Text style={styles.countText} accessibilityLiveRegion="polite">
        {venta.unidades}
      </Text>
    </View>
  );

  const renderForm = () => (
    <View style={styles.form}>
      <Pressable
        onPress={venta.volverAProductos}
        disabled={venta.blocked}
        accessibilityRole="button"
        accessibilityLabel="Volver a seleccionar productos"
        accessibilityState={{ disabled: venta.blocked }}
        style={styles.back}
      >
        <Ionicons
          name="arrow-back"
          size={16}
          color={colors.primary}
        />
        <Text style={styles.link}>Volver a productos</Text>
      </Pressable>
      <Controller
        control={venta.form.control}
        name="nombreCliente"
        render={({ field, fieldState }) => (
          <AppInput
            label="Nombre del cliente"
            placeholder="¿Para quién es el pedido?"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            disabled={venta.blocked}
            maxLength={100}
          />
        )}
      />
      <Controller
        control={venta.form.control}
        name="referencia"
        render={({ field, fieldState }) => (
          <AppInput
            label="Referencia"
            placeholder="Ej. Mesa 3 o Para llevar"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            disabled={venta.blocked}
            maxLength={30}
          />
        )}
      />
      <View style={styles.receiptHeading}>
        <View style={styles.receiptIdentity}>
          <Ionicons
            name="receipt-outline"
            size={17}
            color={colors.primary}
          />
          <Text style={styles.title}>Resumen del pedido</Text>
        </View>
        {renderCount()}
      </View>
      <View style={styles.receiptColumns}>
        <Text style={[styles.columnLabel, styles.quantityColumn]}>Cant.</Text>
        <Text style={[styles.columnLabel, styles.nameColumn]}>Producto</Text>
        <Text style={[styles.columnLabel, styles.priceColumn]}>P. unit.</Text>
        <Text style={[styles.columnLabel, styles.amountColumn]}>Importe</Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (catalogo.loading) {
      return (
        <LoadingSkeleton
          variant="product"
          count={4}
          columns={columns}
          productSelection
        />
      );
    }

    return (
      <EmptyState
        title={catalogo.error?.titulo ?? "Sin productos disponibles"}
        message={catalogo.error?.mensaje ?? "Prueba otra búsqueda o consulta al administrador."}
        onAction={catalogo.error ? catalogo.refresh : undefined}
        loading={catalogo.refreshing}
      />
    );
  };

  const renderProducts = () => (
    <View style={styles.body}>
      <View style={styles.search}>
        <SearchInput
          value={catalogo.search}
          onChangeText={catalogo.setSearch}
          loading={catalogo.searching}
        />
        <View style={styles.row}>
          <Text style={styles.title}>Productos</Text>
          {renderCount()}
        </View>
      </View>
      <FlatList
        ref={productsList}
        key={columns}
        data={catalogo.loading ? [] : catalogo.productos}
        numColumns={columns}
        extraData={venta.lineas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={columns === 2 ? styles.gridCell : styles.singleCell}>
            <ProductCard
              producto={item}
              grid
              cantidad={venta.lineas.find((linea) => linea.producto.id === item.id)?.cantidad ?? 0}
              disabled={venta.blocked || catalogo.pageLoading || (venta.lineas.length >= 100
                && !venta.lineas.some((linea) => linea.producto.id === item.id))}
              onChange={venta.cambiarCantidad}
            />
          </View>
        )}
        style={styles.body}
        contentContainerStyle={styles.list}
        columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
        ListHeaderComponent={catalogo.error && catalogo.productos.length > 0 ? (
          <EmptyState
            title={catalogo.error.titulo}
            message={catalogo.error.mensaje}
            onAction={catalogo.refresh}
            loading={catalogo.refreshing}
          />
        ) : undefined}
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={(
          <Pagination
            pagination={catalogo.pagination}
            page={catalogo.page}
            onPageChange={handlePageChange}
            loading={catalogo.pageLoading}
            disabled={catalogo.searching || venta.blocked}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <SkeletonRefreshControl
            onRefresh={catalogo.refresh}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderDetails = () => (
    <FlatList
      data={venta.lineas}
      keyExtractor={(item) => item.producto.id}
      style={styles.body}
      contentContainerStyle={styles.list}
      ListHeaderComponent={renderForm()}
      renderItem={({ item }) => (
        <View style={styles.receiptItem}>
          <Text style={[styles.receiptQuantity, styles.quantityColumn]}>{item.cantidad}</Text>
          <Text style={[styles.receiptName, styles.nameColumn]}>{item.producto.nombre}</Text>
          <Text style={[styles.receiptPrice, styles.priceColumn]}>{formatCurrency(item.producto.precio)}</Text>
          <Text style={[styles.receiptAmount, styles.amountColumn]}>
            {formatCurrency(Math.round(item.producto.precio * 100) * item.cantidad / 100)}
          </Text>
        </View>
      )}
      ListFooterComponent={(
        <View style={styles.receiptFooter}>
          <Text style={styles.receiptNote}>Puedes volver a productos para editar las cantidades.</Text>
        </View>
      )}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );

  const renderCheckout = () => (
    <View style={styles.checkout}>
      <View style={styles.row}>
        <Text style={styles.title}>Total{selecting ? "" : " estimado"}</Text>
        <Text style={styles.total}>{formatCurrency(venta.total)}</Text>
      </View>
      {venta.pendienteConfirmacion && !venta.loading && (
        <Text style={styles.secondary}>
          Reintenta el mismo pedido para confirmar el registro sin duplicarlo.
        </Text>
      )}
      {venta.total > 9999999999.99 && (
        <Text style={styles.warning}>El total supera el importe permitido. Reduce las cantidades.</Text>
      )}
      {selecting ? (
        <AppButton
          title="Continuar →"
          onPress={venta.continuar}
          disabled={!venta.canContinue}
          style={styles.continueButton}
          fullWidth
        />
      ) : (
        <View style={styles.checkoutActions}>
          <AppButton
            title={venta.pendienteConfirmacion && !venta.cobrarSeleccionado ? "Reintentar reserva" : "Registrar reserva"}
            variant="warning"
            onPress={() => handleSubmit(false)}
            loading={venta.loading && !venta.cobrarSeleccionado}
            disabled={!venta.canSubmit || (venta.pendienteConfirmacion && venta.cobrarSeleccionado)}
            style={styles.checkoutButton}
            textStyle={styles.checkoutButtonText}
          />
          <AppButton
            title={venta.pendienteConfirmacion && venta.cobrarSeleccionado ? "Reintentar registro" : "Registrar pedido"}
            onPress={() => handleSubmit(true)}
            loading={venta.loading && venta.cobrarSeleccionado}
            disabled={!venta.canSubmit || (venta.pendienteConfirmacion && !venta.cobrarSeleccionado)}
            style={styles.checkoutButton}
            textStyle={styles.checkoutButtonText}
          />
        </View>
      )}
    </View>
  );

  const renderModals = () => (
    <>
      <AppModal
        visible={confirmPayment}
        variant="confirmation"
        titulo="Registrar pedido pagado"
        mensaje={`Confirma que recibiste ${formatCurrency(venta.total)} en efectivo. El pedido se registrará como pagado.`}
        acceptText="Sí, recibí el efectivo"
        onAccept={() => {
          setConfirmPayment(false);
          void venta.submit(true);
        }}
        onCancel={() => setConfirmPayment(false)}
      />
      <AppModal
        visible={!!venta.error}
        titulo={venta.error?.titulo ?? ""}
        mensaje={venta.error?.mensaje ?? ""}
        status={venta.error?.status}
        onAccept={venta.dismissError}
      />
      <AppModal
        visible={!!leaveAction && !venta.error && !venta.pendienteConfirmacion}
        variant="confirmation"
        titulo="Descartar nueva venta"
        mensaje="Se perderán los productos y los datos que ingresaste. ¿Quieres salir?"
        acceptText="Descartar"
        onAccept={handleDiscard}
        onCancel={() => setLeaveAction(null)}
      />
      <AppModal
        visible={!!leaveAction && !venta.error && venta.pendienteConfirmacion}
        titulo="Confirma el registro"
        mensaje="Reintenta el registro antes de salir para confirmar si el servidor recibió el pedido."
        acceptText="Entendido"
        onAccept={() => setLeaveAction(null)}
      />
    </>
  );

  return (
    <>
      <SaleModal
        progress={progress}
        subtitle={selecting ? "Selecciona los productos" : "Completa los datos del pedido"}
        onClose={() => navigation.goBack()}
        busy={venta.loading}
      >
        {selecting ? renderProducts() : renderDetails()}
        {!keyboardVisible && renderCheckout()}
      </SaleModal>
      {renderModals()}
    </>
  );
};

const styles = StyleSheet.create({
  countBadge: {
    minWidth: 24,
    minHeight: 24,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  countText: {
    color: colors.textOnPrimary,
    fontSize: typography.size.caption - 1,
    fontWeight: typography.weight.bold,
  },
  body: {
    flex: 1,
  },
  search: {
    padding: spacing.md,
    gap: spacing.base,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  singleCell: {
    width: "100%",
  },
  gridRow: {
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  gridCell: {
    width: "48.5%",
  },
  separator: {
    height: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  form: {
    paddingTop: spacing.sm,
    paddingBottom: 0,
    gap: spacing.base,
  },
  back: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  link: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },
  title: {
    color: colors.text,
    fontSize: typography.size.button,
    fontWeight: typography.weight.semibold,
  },
  secondary: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },
  total: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: typography.weight.bold,
  },
  receiptHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  receiptIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  receiptColumns: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    backgroundColor: colors.surface,
  },
  columnLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.caption - 1,
    fontWeight: typography.weight.medium,
  },
  quantityColumn: {
    flex: 0.6,
    textAlign: "center",
  },
  nameColumn: {
    flex: 2,
  },
  priceColumn: {
    flex: 1,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  amountColumn: {
    flex: 1.2,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  receiptQuantity: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  receiptName: {
    color: colors.text,
    fontSize: typography.size.caption,
    lineHeight: 18,
  },
  receiptPrice: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },
  receiptAmount: {
    color: colors.text,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  receiptItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  receiptFooter: {
    padding: spacing.sm,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    backgroundColor: colors.surface,
  },
  receiptNote: {
    fontSize: typography.size.caption - 1,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  checkout: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    gap: spacing.md,
  },
  checkoutActions: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.sm,
  },
  checkoutButton: {
    flex: 1,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  checkoutButtonText: {
    fontSize: 12,
  },
  continueButton: {
    borderRadius: radius.full,
  },
  warning: {
    color: colors.error,
    fontSize: typography.size.caption,
  },
  loading: {
    padding: spacing.xl,
  },
});
