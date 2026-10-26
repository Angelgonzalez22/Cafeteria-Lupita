/* CARGA DEL DETALLE CON CLIENTE, ESTADOS Y PRODUCTOS */

import { StyleSheet, View } from "react-native";
import { Skeleton, SkeletonBlock } from "../common/Skeleton";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";

export const OrderDetailSkeleton = ({ kitchen = false }: { kitchen?: boolean }) => {
  return (
    <Skeleton
      style={styles.container}
      label="Cargando detalle del pedido"
    >
      <View style={styles.customer}>
        <View style={styles.row}>
          <View style={styles.identity}>
            <SkeletonBlock style={styles.label} />
            <SkeletonBlock style={styles.customerName} />
          </View>
          <View style={styles.date}>
            <SkeletonBlock style={styles.dateLine} />
            <SkeletonBlock style={styles.time} />
          </View>
        </View>
        <View style={styles.row}>
          <SkeletonBlock style={styles.label} />
          <SkeletonBlock style={styles.metaValue} />
        </View>
        {!kitchen && (
          <View style={styles.row}>
            <SkeletonBlock style={styles.label} />
            <SkeletonBlock style={styles.metaValue} />
          </View>
        )}
      </View>
      <View style={styles.track}>
        <SkeletonBlock style={styles.trackTitle} />
        <View style={styles.row}>
          {[0, 1, 2].map((step) => (
            <View
              key={step}
              style={styles.step}
            >
              <View style={styles.nodeRow}>
                <SkeletonBlock style={[styles.line, step === 0 && styles.invisible]} />
                <SkeletonBlock style={styles.circle} />
                <SkeletonBlock style={[styles.line, step === 2 && styles.invisible]} />
              </View>
              <SkeletonBlock style={styles.stepLabel} />
            </View>
          ))}
        </View>
      </View>
      <View style={styles.row}>
        <SkeletonBlock style={styles.tableTitle} />
        <SkeletonBlock style={styles.units} />
      </View>
      <View>
        <View style={styles.tableHeader}>
          <SkeletonBlock style={styles.quantity} />
          <SkeletonBlock style={styles.product} />
          {!kitchen && <SkeletonBlock style={styles.amount} />}
        </View>
        {[0, 1, 2].map((row) => (
          <View
            key={row}
            style={styles.productRow}
          >
            <SkeletonBlock style={styles.quantity} />
            <View style={styles.productIdentity}>
              <SkeletonBlock style={styles.productName} />
              {!kitchen && <SkeletonBlock style={styles.unitPrice} />}
            </View>
            {!kitchen && <SkeletonBlock style={styles.amount} />}
          </View>
        ))}
      </View>
      {!kitchen && (
        <View style={styles.row}>
          <SkeletonBlock style={styles.tableTitle} />
          <SkeletonBlock style={styles.total} />
        </View>
      )}
    </Skeleton>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  customer: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  identity: {
    flex: 1,
    gap: spacing.sm,
  },
  label: {
    width: 64,
    height: 10,
  },
  customerName: {
    width: "65%",
    height: 24,
  },
  date: {
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  dateLine: {
    width: 78,
    height: 10,
  },
  time: {
    width: 50,
    height: 10,
  },
  metaValue: {
    width: "36%",
    height: 11,
  },
  track: {
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.md,
  },
  trackTitle: {
    width: 100,
    height: 12,
  },
  step: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
  nodeRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  line: {
    flex: 1,
    height: 2,
    borderRadius: 0,
  },
  invisible: {
    backgroundColor: "transparent",
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  stepLabel: {
    width: "65%",
    height: 10,
  },
  tableTitle: {
    width: 85,
    height: 14,
  },
  units: {
    width: 54,
    height: 10,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quantity: {
    width: 25,
    height: 11,
  },
  product: {
    flex: 1,
    height: 10,
  },
  amount: {
    width: 55,
    height: 13,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  productIdentity: {
    flex: 1,
    gap: spacing.sm,
  },
  productName: {
    width: "80%",
    height: 14,
  },
  unitPrice: {
    width: 48,
    height: 10,
  },
  total: {
    width: 85,
    height: 25,
  },
});
