/* TARJETAS DE CARGA PARA LISTADOS Y DETALLES */

import { StyleSheet, View } from "react-native";
import { Skeleton, SkeletonBlock } from "./Skeleton";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";

type LoadingSkeletonProps = {
  variant?: "order" | "product" | "detail";
  count?: number;
  columns?: 1 | 2;
  productSelection?: boolean;
};

export const LoadingSkeleton = ({ variant = "order", count = 3, columns = 1, productSelection = false }: LoadingSkeletonProps) => {
  const productGrid = productSelection || columns === 2;
  if (variant === "product") {
    return (
      <Skeleton style={styles.grid} label="Cargando productos">
        {Array.from({ length: count }, (_, index) => (
          <View
            key={index}
            style={[styles.productCard, productGrid && styles.productGridCard, columns === 2 && styles.half]}
          >
            {productGrid && <SkeletonBlock style={styles.picture} />}
            <View style={styles.productIdentity}>
              <View style={styles.row}>
                <SkeletonBlock style={styles.productName} />
                {!productSelection && <SkeletonBlock style={styles.productBadge} />}
              </View>
              {!productGrid && <SkeletonBlock style={styles.description} />}
              <SkeletonBlock style={styles.productPrice} />
            </View>
            {productSelection && (
              <View style={[styles.productControls, productGrid && styles.gridControls]}>
                <SkeletonBlock style={styles.quantityButton} />
                <SkeletonBlock style={styles.quantityValue} />
                <SkeletonBlock style={styles.quantityButton} />
              </View>
            )}
          </View>
        ))}
      </Skeleton>
    );
  }

  return (
    <Skeleton style={styles.grid}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[styles.card, columns === 2 && styles.half]}
        >
          {variant === "order" ? (
            <View style={styles.orderHeader}>
              <SkeletonBlock style={styles.orderIcon} />
              <View style={styles.orderIdentity}>
                <SkeletonBlock style={styles.orderNumber} />
                <SkeletonBlock style={styles.orderCustomer} />
              </View>
              <SkeletonBlock style={styles.amount} />
            </View>
          ) : (
            <>
              <View style={styles.row}>
                <SkeletonBlock style={styles.name} />
                <SkeletonBlock style={styles.amount} />
              </View>
              <SkeletonBlock style={styles.description} />
            </>
          )}
          <View style={styles.row}>
            <SkeletonBlock style={styles.badge} />
            <SkeletonBlock style={styles.time} />
          </View>
          {variant === "detail" && <SkeletonBlock style={styles.description} />}
        </View>
      ))}
    </Skeleton>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: "100%",
    padding: spacing.base,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: radius.md,
  },
  productGridCard: {
    padding: spacing.sm,
    gap: spacing.sm,
    borderRadius: radius.lg,
  },
  productIdentity: {
    gap: spacing.xs,
  },
  productName: {
    width: "60%",
    height: 20,
  },
  productBadge: {
    width: 52,
    height: 18,
    borderRadius: radius.full,
  },
  productPrice: {
    width: 58,
    height: 20,
  },
  productControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "flex-end",
    width: 112,
    height: 44,
  },
  gridControls: {
    width: "100%",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
  },
  quantityValue: {
    width: 12,
    height: 14,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  orderIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
  },
  orderIdentity: {
    flex: 1,
    gap: spacing.sm,
  },
  orderNumber: {
    width: "50%",
    height: 10,
  },
  orderCustomer: {
    width: "85%",
    height: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  card: {
    width: "100%",
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: radius.md,
  },
  half: {
    width: "47.5%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  name: {
    width: "52%",
    height: 15,
  },
  amount: {
    width: "23%",
    height: 18,
  },
  description: {
    width: "68%",
    height: 12,
  },
  badge: {
    width: "35%",
    height: 18,
  },
  time: {
    width: "20%",
    height: 12,
  },
  picture: {
    width: "100%",
    height: 82,
  },
});
