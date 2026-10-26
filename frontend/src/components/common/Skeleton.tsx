/* BLOQUES REUTILIZABLES PARA LA CARGA DE CONTENIDO */

import type { PropsWithChildren } from "react";
import { Animated, StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { colors } from "../../constants/colors";
import { radius } from "../../constants/spacing";
import { useSkeletonAnimation } from "../../hooks/useSkeletonAnimation";

type SkeletonProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  label?: string;
}>;

export const Skeleton = ({ children, style, label = "Cargando contenido" }: SkeletonProps) => {
  const opacity = useSkeletonAnimation();

  return (
    <Animated.View
      accessible
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      style={[style, { opacity }]}
    >
      {children}
    </Animated.View>
  );
};

export const SkeletonBlock = ({ style }: { style?: StyleProp<ViewStyle> }) => {
  return <View style={[styles.block, style]} />;
};

const styles = StyleSheet.create({
  block: {
    height: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
});
