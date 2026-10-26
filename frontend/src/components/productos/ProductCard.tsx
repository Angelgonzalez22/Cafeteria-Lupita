/* PRODUCTO CON CONTROLES DE CANTIDAD */

import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { QuantityStepper } from "../common/QuantityStepper";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import type { ProductoResponse } from "../../models/productos/producto";
import { formatCurrency } from "../../utils/format";

type ProductCardProps = {
  producto: ProductoResponse;
  cantidad?: number;
  disabled?: boolean;
  grid?: boolean;
  onChange?: (producto: ProductoResponse, delta: number) => void;
};

export const ProductCard = ({ producto, cantidad = 0, disabled, grid = false, onChange }: ProductCardProps) => {
  return (
    <View style={[styles.card, grid && styles.gridCard, !!onChange && cantidad > 0 && styles.selected]}>
      <View style={[styles.row, grid && styles.gridContent]}>
        {grid && !producto.imagenUrl && (
          <View style={styles.placeholder}>
            <Ionicons
              name="fast-food-outline"
              size={28}
              color={colors.primary}
            />
          </View>
        )}
        {!!producto.imagenUrl && (
          <Image
            source={{ uri: producto.imagenUrl }}
            style={grid ? styles.gridImage : styles.image}
            accessibilityLabel={producto.nombre}
          />
        )}

        <View style={styles.identity}>
          <View style={styles.productHeading}>
            <Text style={[styles.name, grid && styles.gridName]}>{producto.nombre}</Text>
            {!onChange && typeof producto.activo === "boolean" && (
              <View style={[styles.activeBadge, !producto.activo && styles.inactiveBadge]}>
                <View style={[styles.activeDot, !producto.activo && styles.inactiveDot]} />
                <Text style={[styles.activeText, !producto.activo && styles.inactiveText]}>
                  {producto.activo ? "Activo" : "Inactivo"}
                </Text>
              </View>
            )}
          </View>
          {!grid && !!producto.descripcion && <Text style={styles.secondary}>{producto.descripcion}</Text>}
          <Text style={styles.price}>{formatCurrency(producto.precio)}</Text>
        </View>
      </View>

      {onChange && (
        <View style={styles.controls}>
          <QuantityStepper
            value={cantidad}
            label={producto.nombre}
            disabled={disabled}
            compact={grid}
            onChange={(delta) => onChange(producto, delta)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  productHeading: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
  },
  inactiveBadge: {
    backgroundColor: colors.surfaceMuted,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  inactiveDot: {
    backgroundColor: colors.textMuted,
  },
  activeText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: typography.weight.semibold,
  },
  inactiveText: {
    color: colors.textSecondary,
  },
  gridCard: {
    flex: 1,
    padding: spacing.sm,
    gap: spacing.xs,
    borderRadius: radius.lg,
  },
  gridContent: {
    flexDirection: "column",
    flex: 1,
    gap: spacing.sm,
  },
  gridName: {
    fontSize: typography.size.caption + 1,
  },
  placeholder: {
    height: 82,
    width: "100%",
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  gridImage: {
    height: 82,
    width: "100%",
    borderRadius: radius.md,
    resizeMode: "cover",
  },
  card: {
    padding: spacing.base,
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
  },
  identity: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
  },
  secondary: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },
  price: {
    color: colors.primary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.md,
  },
});
