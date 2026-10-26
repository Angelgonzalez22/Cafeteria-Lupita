/* REPORTES POR FECHA CON RESUMEN EN DOS COLUMNAS */

import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SkeletonRefreshControl } from "../../components/common/SkeletonRefreshControl";

import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSkeleton } from "../../components/common/LoadingSkeleton";
import { SummaryCard } from "../../components/home/SummaryCard";
import { ScreenWrapper } from "../../components/layout/ScreenWrapper";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { OrderCalendarModal } from "../../components/modals/OrderCalendarModal";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useReportes } from "../../hooks/reportes/useReportes";
import { useResponsive } from "../../hooks/useResponsive";
import { formatCurrency } from "../../utils/format";
import { formatSelectedDay } from "../../utils/date";

export const ReportesScreen = () => {
  const reportes = useReportes();
  const { horizontalPadding, maxContentWidth, fontScale } = useResponsive();
  const summary = reportes.summary;
  const singleColumn = fontScale >= 1.6;

  const renderFilters = () => (
    <View style={styles.filters}>
      <View style={styles.heading}>
        <Text style={styles.title}>Período del reporte</Text>
        <Pressable
          onPress={reportes.resetToday}
          accessibilityRole="button"
          accessibilityLabel="Consultar reportes de hoy"
          style={styles.todayButton}
        >
          <Text style={styles.todayText}>Hoy</Text>
        </Pressable>
      </View>
      <View style={styles.dateRow}>
        <Pressable
          onPress={() => reportes.openCalendar("desde")}
          accessibilityRole="button"
          accessibilityLabel={`Desde ${formatSelectedDay(reportes.desde)}, cambiar fecha`}
          style={({ pressed }) => [styles.dateButton, reportes.calendarField === "desde" && styles.dateSelected, pressed && styles.pressed]}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={colors.primary}
          />
          <View style={styles.dateIdentity}>
            <Text style={styles.caption}>Desde</Text>
            <Text style={styles.dateText}>{formatSelectedDay(reportes.desde)}</Text>
          </View>
          <Ionicons
            name="chevron-down"
            size={14}
            color={colors.textMuted}
          />
        </Pressable>
        <Pressable
          onPress={() => reportes.openCalendar("hasta")}
          accessibilityRole="button"
          accessibilityLabel={`Hasta ${formatSelectedDay(reportes.hasta)}, cambiar fecha`}
          style={({ pressed }) => [styles.dateButton, reportes.calendarField === "hasta" && styles.dateSelected, pressed && styles.pressed]}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={colors.primary}
          />
          <View style={styles.dateIdentity}>
            <Text style={styles.caption}>Hasta</Text>
            <Text style={styles.dateText}>{formatSelectedDay(reportes.hasta)}</Text>
          </View>
          <Ionicons
            name="chevron-down"
            size={14}
            color={colors.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );

  const renderSummary = () => {
    if (reportes.summaryError) {
      return (
        <EmptyState
          title={reportes.summaryError.titulo}
          message={reportes.summaryError.mensaje}
          icon="cloud-offline-outline"
          onAction={reportes.refresh}
          loading={reportes.refreshing}
        />
      );
    }

    return (
      <View style={styles.statsGrid}>
        <View style={[styles.statCell, singleColumn && styles.fullCell]}>
          <SummaryCard
            compact
            highlighted
            icon="wallet-outline"
            label="Total cobrado"
            value={formatCurrency(summary?.totalCobrado ?? 0)}
            loading={reportes.summaryLoading}
            style={styles.statCard}
          />
        </View>
        <View style={[styles.statCell, singleColumn && styles.fullCell]}>
          <SummaryCard
            compact
            icon="trending-up-outline"
            label="Utilidad bruta estimada"
            value={formatCurrency(summary?.utilidadBrutaEstimada ?? 0)}
            loading={reportes.summaryLoading}
            style={styles.statCard}
          />
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (reportes.productsLoading) return <LoadingSkeleton count={3} />;
    if (reportes.summaryError && reportes.productsError) return null;

    return (
      <EmptyState
        title={reportes.productsError?.titulo ?? "Sin ventas registradas"}
        message={reportes.productsError?.mensaje ?? "No hay productos vendidos en este período."}
        onAction={reportes.productsError ? reportes.refresh : undefined}
        loading={reportes.refreshing}
      />
    );
  };

  return (
    <ScreenWrapper
      padded={false}
      edges={[]}
      contentStyle={styles.root}
    >
      <SectionHeader title="Reportes" />
      <FlatList
        data={reportes.productsLoading ? [] : reportes.productos}
        keyExtractor={(item) => item.productoId}
        contentContainerStyle={[
          styles.list,
          { paddingHorizontal: horizontalPadding, maxWidth: maxContentWidth },
        ]}
        ListHeaderComponent={(
          <View style={styles.section}>
            {renderFilters()}
            {renderSummary()}
            <Text style={styles.title}>Productos más vendidos</Text>
            {reportes.productsError && reportes.productos.length > 0 && (
              <EmptyState
                title={reportes.productsError.titulo}
                message={reportes.productsError.mensaje}
                onAction={reportes.refresh}
                loading={reportes.refreshing}
              />
            )}
          </View>
        )}
        ListEmptyComponent={renderEmpty() ?? undefined}
        renderItem={({ item, index }) => (
          <View style={styles.product}>
            <View style={styles.rank}><Text style={styles.rankText}>{index + 1}</Text></View>
            <View style={styles.productIdentity}>
              <Text style={styles.productName}>{item.nombre}</Text>
              <Text style={styles.caption}>{item.cantidadVendida} unidades vendidas</Text>
            </View>
            <Text style={styles.productAmount}>{formatCurrency(item.totalVentas)}</Text>
          </View>
        )}
        refreshControl={
          <SkeletonRefreshControl
            onRefresh={reportes.refresh}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      <OrderCalendarModal
        visible={!!reportes.calendarField}
        title={reportes.calendarField === "desde" ? "Inicio del período" : "Fin del período"}
        value={reportes.calendarField === "desde" ? reportes.desde : reportes.hasta}
        today={reportes.today}
        onSelect={reportes.selectDay}
        onClose={reportes.closeCalendar}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  root: {
    maxWidth: "100%",
  },
  list: {
    width: "100%",
    alignSelf: "center",
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.base,
    paddingVertical: spacing.base,
  },
  filters: {
    gap: spacing.sm,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: colors.text,
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
  },
  todayButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  todayText: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  dateRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 56,
  },
  dateSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  dateIdentity: {
    flex: 1,
    gap: spacing.xs,
  },
  dateText: {
    color: colors.text,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  statCell: {
    width: "47.5%",
  },
  fullCell: {
    width: "100%",
  },
  statCard: {
    flex: 1,
    minHeight: 100,
  },
  product: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.divider,
    gap: spacing.md,
  },
  rank: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  productIdentity: {
    flex: 1,
    gap: spacing.xs,
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
    fontVariant: ["tabular-nums"],
  },
  pressed: {
    opacity: 0.65,
  },
});
