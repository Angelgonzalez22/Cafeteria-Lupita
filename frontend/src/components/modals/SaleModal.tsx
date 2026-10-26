/* CONTENEDOR ANIMADO DE NUEVA VENTA */

import type { PropsWithChildren } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Animated, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

type SaleModalProps = PropsWithChildren<{
  progress: Animated.Value;
  subtitle: string;
  onClose: () => void;
  busy?: boolean;
}>;

export const SaleModal = ({ children, progress, subtitle, onClose, busy }: SaleModalProps) => {
  return (
    <Animated.View
      style={[
        styles.root,
        { opacity: progress.interpolate({ inputRange: [0, 0.65, 1], outputRange: [0, 1, 1], extrapolate: "clamp" }) },
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.placement}
        >
          <Animated.View
            accessibilityViewIsModal
            style={[
              styles.modal,
              {
                transform: [
                  { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) },
                  { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
                ],
              },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.icon}>
                <Ionicons
                  name="bag-handle-outline"
                  size={19}
                  color={colors.primary}
                />
              </View>
              <View style={styles.identity}>
                <Text
                  accessibilityRole="header"
                  style={styles.title}
                >Nueva venta</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
              <Pressable
                onPress={onClose}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel="Cerrar nueva venta"
                accessibilityState={{ disabled: busy }}
                style={({ pressed }) => [styles.close, pressed && styles.pressed]}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backdrop,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  placement: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modal: {
    flexShrink: 1,
    height: "96%",
    width: "100%",
    maxWidth: 520,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  identity: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: typography.weight.semibold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.5,
  },
});
