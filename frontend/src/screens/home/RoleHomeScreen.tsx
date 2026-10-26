/* INICIO CON RESUMEN Y PEDIDOS SEGÚN EL ROL */

import { useNavigation } from "@react-navigation/native";
import { useRef } from "react";
import { SkeletonRefreshControl } from "../../components/common/SkeletonRefreshControl";
import { Ionicons } from "@expo/vector-icons";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppButton } from "../../components/common/AppButton";
import { Pagination } from "../../components/common/Pagination";
import { OfflineStatus } from "../../components/common/OfflineStatus";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSkeleton } from "../../components/common/LoadingSkeleton";
import { FilterChips } from "../../components/common/FilterChips";
import { SummaryCard } from "../../components/home/SummaryCard";
import { CurvedHeader } from "../../components/layout/CurvedHeader";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { ScreenWrapper } from "../../components/layout/ScreenWrapper";
import { AppModal } from "../../components/modals/AppModal";
import { OrderCalendarModal } from "../../components/modals/OrderCalendarModal";
import { OrderCard } from "../../components/pedidos/OrderCard";

import { colors } from "../../constants/colors";
import { homeFilters, kitchenFilters } from "../../constants/home";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import { useSessionStore } from "../../store/sessionStore";
import { useHome } from "../../hooks/home/useHome";
import { useResponsive } from "../../hooks/useResponsive";
import type { HomeOrder } from "../../models/home/home";
import type { MainTabParamList, RootStackParamList } from "../../models/auth/navigation";
import { formatCurrency } from "../../utils/format";
import { formatSelectedDay } from "../../utils/date";

export const RoleHomeScreen = ({ ordersOnly = false }: { ordersOnly?: boolean }) => {
  const navigation = useNavigation<CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >>();
  const session = useSessionStore((state) => state.session);

  const home = useHome(session?.usuario, !ordersOnly);
  const list = useRef<FlatList<HomeOrder>>(null);
  const { horizontalPadding, maxContentWidth, isTablet, fontScale } = useResponsive();

  const kitchen = home.role === "COCINA";
  const admin = home.role === "ADMINISTRADOR";
  const columns = isTablet && fontScale < 1.4 ? 2 : 1;
  const handleRefresh = () => {
    void home.refresh();
  };

  const handlePageChange = (page: number) => {
    home.goToPage(page);
    list.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const renderHeader = () => {
    if (ordersOnly) {
      return <SectionHeader title="Pedidos" />;
    }

    return (
      <CurvedHeader>
        <View style={styles.welcome}>
          <View style={styles.welcomeRow}>
            <Text
              accessibilityRole="header"
              style={styles.welcomeTitle}
            >
              Hola, {session?.usuario.nombre}
            </Text>
            <OfflineStatus header />
          </View>
          <Text style={styles.welcomeMessage}>
            {kitchen ? "Resumen de cocina de hoy" : "Así va tu cafetería hoy"}
          </Text>
        </View>
      </CurvedHeader>
    );
  };

  const renderSummary = () => {
    if (home.summaryError) {
      return (
        <EmptyState
          title={home.summaryError.titulo}
          message={home.summaryError.mensaje}
          icon="cloud-offline-outline"
          onAction={handleRefresh}
          loading={home.refreshing}
        />
      );
    }

    const summary = home.summary;
    const mainLabel = kitchen
      ? "Pedidos recibidos hoy"
      : admin ? "Ventas cobradas hoy" : "Tus ventas cobradas hoy";
    const mainValue = kitchen
      ? summary?.pedidosRealizados ?? 0
      : formatCurrency(summary?.totalCobrado ?? 0);
    const firstValue = kitchen
      ? summary?.pendientesPreparacion ?? 0
      : summary?.pedidosRealizados ?? 0;
    const secondValue = kitchen
      ? summary?.preparando ?? 0
      : summary?.pendientesPago ?? 0;

    return (
      <View style={styles.summary}>
        <SummaryCard
          highlighted
          label={mainLabel}
          value={mainValue}
          subtitle={kitchen ? undefined : (summary?.pedidosPagados ?? 0) + " pedidos pagados"}
          loading={home.summaryLoading}
        />

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <SummaryCard
              compact
              label={kitchen ? "Pendientes" : "Pedidos realizados"}
              value={firstValue}
              loading={home.summaryLoading}
            />
          </View>

          <View style={styles.statCell}>
            <SummaryCard
              compact
              label={kitchen ? "Preparando" : "Faltan por cobrar"}
              value={secondValue}
              loading={home.summaryLoading}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderOrdersHeading = () => ordersOnly ? (
    <Pressable
      onPress={home.openCalendar}
      hitSlop={4}
      disabled={!home.summary}
      accessibilityRole="button"
      accessibilityLabel={`Cambiar fecha de pedidos: ${formatSelectedDay(home.selectedDay ?? "")}`}
      accessibilityState={{ disabled: !home.summary }}
      style={({ pressed }) => [styles.dateSelector, pressed && styles.datePressed]}
    >
      <Ionicons
        name="calendar-outline"
        size={17}
        color={colors.primary}
      />
      <Text style={styles.dateText}>
        {home.selectedDay ? `${home.selectedDay.slice(8, 10)}/${home.selectedDay.slice(5, 7)}` : "—"}
      </Text>
    </Pressable>
  ) : (
    <View style={styles.sectionRow}>
      <Text
        accessibilityRole="header"
        style={styles.sectionTitle}
      >
        Los 5 pedidos más recientes
      </Text>

      {!ordersOnly && (
        <Pressable
          onPress={() => navigation.navigate("Pedidos")}
          accessibilityRole="button"
          style={styles.textButton}
        >
          <Text style={styles.link}>
            Ver todos
          </Text>
        </Pressable>
      )}
    </View>
  );

  const renderOverview = () => {
    if (!home.role) {
      return (
        <EmptyState
          title="Acceso no disponible"
          message="Tu rol no tiene un inicio disponible. Contacta al administrador."
          icon="lock-closed-outline"
        />
      );
    }

    return (
      <View style={styles.overview}>
        {!ordersOnly && renderSummary()}

        {!ordersOnly && !kitchen && (
          <AppButton
            title="+ Nueva venta"
            onPress={() => navigation.navigate("NuevaVenta")}
            fullWidth
          />
        )}

        {!ordersOnly && renderOrdersHeading()}

        {ordersOnly && (
          <View style={styles.filterToolbar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContent}
            >
              <FilterChips
                options={kitchen ? kitchenFilters : homeFilters}
                value={home.filter}
                onChange={home.setFilter}
                inline
              />
            </ScrollView>
            {renderOrdersHeading()}
          </View>
        )}

        {ordersOnly && home.summaryError && home.orders.length > 0 && renderSummary()}

        {home.ordersError && home.orders.length > 0 && (
          <Text
            accessibilityLiveRegion="polite"
            style={styles.warning}
          >
            No se pudo actualizar el listado. {home.ordersError.mensaje}
          </Text>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (!home.role) {
      return null;
    }

    if (home.summaryError) {
      return ordersOnly && home.orders.length === 0 ? renderSummary() : null;
    }

    if (home.summaryLoading || home.ordersLoading) {
      return <LoadingSkeleton count={3} columns={columns} />;
    }

    if (home.ordersError) {
      return (
        <EmptyState
          title={home.ordersError.titulo}
          message={home.ordersError.mensaje}
          icon="cloud-offline-outline"
          onAction={handleRefresh}
          loading={home.refreshing}
        />
      );
    }

    const emptyTitle = !ordersOnly
      ? "Aún no hay pedidos"
      : kitchen && home.filter === "activos"
        ? "Todo al día en cocina"
      : home.filter === "listos"
        ? "No hay pedidos listos"
        : home.filter === "sin-pagar"
          ? "No hay pedidos por cobrar"
          : "Aún no hay pedidos";

    return (
      <EmptyState
        title={emptyTitle}
        message={kitchen && ordersOnly && home.filter === "activos"
          ? "Los pedidos pendientes aparecerán aquí para comenzar su preparación."
          : ordersOnly ? "No hay pedidos para la fecha y el filtro seleccionados."
            : "Los pedidos de hoy aparecerán aquí cuando estén disponibles."}
        icon={kitchen ? "restaurant-outline" : "receipt-outline"}
      />
    );
  };

  const renderModals = () => (
    <>
      <AppModal
        visible={!!home.preparationConfirmation && !home.feedback}
        variant="confirmation"
        titulo={home.preparationConfirmation?.action === "iniciar" ? "Comenzar preparación" : "Marcar pedido listo"}
        mensaje={home.preparationConfirmation?.action === "iniciar"
          ? `¿Estás seguro de comenzar a preparar el pedido #${home.preparationConfirmation.numero}?`
          : `¿Estás seguro de marcar el pedido #${home.preparationConfirmation?.numero ?? ""} como listo? Confirma que todos sus productos están preparados.`}
        icon={home.preparationConfirmation?.action === "iniciar" ? "restaurant-outline" : "checkmark-done-outline"}
        iconColor={colors.primary}
        acceptText={home.preparationConfirmation?.action === "iniciar" ? "Sí, comenzar" : "Sí, está listo"}
        cancelText="Cancelar"
        onAccept={() => { void home.confirmPreparation(); }}
        onCancel={home.cancelPreparation}
      />
      <AppModal
        visible={!!home.feedback}
        status={home.feedback?.status}
        titulo={home.feedback?.titulo ?? ""}
        mensaje={home.feedback?.mensaje ?? ""}
        onAccept={home.dismissFeedback}
      />
      {ordersOnly && home.selectedDay && home.summary && (
        <OrderCalendarModal
          visible={home.calendarVisible}
          value={home.selectedDay}
          today={home.summary.fecha}
          onSelect={home.selectDay}
          onClose={home.closeCalendar}
        />
      )}
    </>
  );

  return (
    <ScreenWrapper
      padded={false}
      edges={[]}
      contentStyle={styles.content}
    >
      {renderHeader()}

      <FlatList
        ref={list}
        key={columns}
        data={home.ordersLoading ? [] : home.orders}
        numColumns={columns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <OrderCard
              order={item}
              kitchenPreview={kitchen}
              showEmployee={ordersOnly}
              compact
              loading={home.busyOrderId === item.id}
              disabled={home.preparationBusy}
              onView={ordersOnly || kitchen
                ? () => navigation.navigate("DetallePedido", { id: item.id })
                : undefined}
              onPreparation={home.changePreparation}
            />
          </View>
        )}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: horizontalPadding, maxWidth: maxContentWidth },
        ]}
        columnWrapperStyle={columns > 1 ? styles.columns : undefined}
        ListHeaderComponent={renderOverview()}
        ListEmptyComponent={renderEmpty() ?? undefined}
        ListFooterComponent={ordersOnly ? (
          <Pagination
            pagination={home.pagination}
            page={home.page}
            onPageChange={handlePageChange}
            loading={home.pageLoading}
          />
        ) : undefined}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <SkeletonRefreshControl
            onRefresh={handleRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {renderModals()}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  filterToolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  filterScroll: {
    flex: 1,
  },
  filterContent: {
    paddingVertical: spacing.xs,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 36,
    minWidth: 86,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  dateText: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  datePressed: {
    opacity: 0.65,
  },
  welcome: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },

  welcomeTitle: {
    flex: 1,
    color: colors.textOnPrimary,
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
  },

  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  welcomeMessage: {
    color: colors.textOnPrimary,
    fontSize: typography.size.body,
  },

  content: {
    flex: 1,
    maxWidth: "100%",
  },

  list: {
    flex: 1,
  },

  listContent: {
    flexGrow: 1,
    width: "100%",
    alignSelf: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  overview: {
    gap: spacing.base,
    paddingBottom: spacing.base,
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  sectionTitle: {
    flex: 1,
    color: colors.text,
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
  },

  textButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },

  link: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },

  summary: {
    gap: spacing.md,
  },

  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },

  statCell: {
    flex: 1,
    minWidth: 130,
  },

  columns: {
    gap: spacing.md,
  },

  listItem: {
    flex: 1,
    minWidth: 0,
  },

  separator: {
    height: spacing.md,
  },

  warning: {
    color: colors.warning,
    fontSize: typography.size.caption,
    lineHeight: 20,
  },

});
