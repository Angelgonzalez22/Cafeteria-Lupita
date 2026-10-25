/* Presenta la marca mientras se prepara la sesión de la app. */

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LupitaMark } from "../../components/common/LupitaMark";
import { ScreenWrapper } from "../../components/layout/ScreenWrapper";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

export const SplashScreen = () => {
  const renderBrand = () => (
    <View style={styles.brand}>
      <View style={styles.markFrame}>
        <LupitaMark size={88} />
      </View>

      <Text style={styles.eyebrow}>
        CAFETERÍA
      </Text>

      <Text
        accessibilityRole="header"
        style={styles.name}
      >
        Lupita
      </Text>

      <View style={styles.divider} />

      <Text style={styles.tagline}>
        Tu día empieza con un buen café
      </Text>
    </View>
  );

  const renderLoading = () => (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Preparando Cafetería Lupita"
      style={styles.loading}
    >
      <ActivityIndicator color={colors.textOnPrimary} />

      <Text style={styles.loadingText}>
        Preparando todo para ti
      </Text>
    </View>
  );

  return (
    <ScreenWrapper
      backgroundColor={colors.primary}
      contentStyle={styles.content}
    >
      <View
        pointerEvents="none"
        accessible={false}
        style={styles.topCircle}
      />

      <View
        pointerEvents="none"
        accessible={false}
        style={styles.bottomCircle}
      />

      {renderBrand()}
      {renderLoading()}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    paddingVertical: spacing.xl,
  },

  topCircle: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: radius.full,
    backgroundColor: colors.primaryPressed,
    top: -130,
    right: -150,
    opacity: 0.6,
  },

  bottomCircle: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    bottom: -120,
    left: -150,
    opacity: 0.2,
  },

  brand: {
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxxl,
  },

  markFrame: {
    width: 136,
    height: 136,
    borderRadius: radius.xl + spacing.sm,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },

  eyebrow: {
    color: colors.textOnPrimary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
    letterSpacing: 5,
    opacity: 0.8,
  },

  name: {
    color: colors.textOnPrimary,
    fontSize: 56,
    fontWeight: typography.weight.bold,
    letterSpacing: -1,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  divider: {
    width: 36,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.textOnPrimary,
    marginVertical: spacing.xl,
    opacity: 0.65,
  },

  tagline: {
    color: colors.textOnPrimary,
    fontSize: typography.size.body,
    textAlign: "center",
    opacity: 0.85,
  },

  loading: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingTop: spacing.xl,
  },

  loadingText: {
    color: colors.textOnPrimary,
    fontSize: typography.size.caption,
    opacity: 0.75,
  },
});