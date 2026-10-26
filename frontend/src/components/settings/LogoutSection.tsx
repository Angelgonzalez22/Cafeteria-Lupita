/* ACCIÓN DE CIERRE DE SESIÓN CON CONFIRMACIÓN */

import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppModal } from "../modals/AppModal";
import { useSession } from "../../hooks/auth/useSession";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

export const LogoutSection = () => {
  const session = useSession();

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Configuración</Text>
      <Pressable
        onPress={session.requestLogout}
        disabled={session.busy}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        accessibilityState={{ disabled: session.busy, busy: session.busy }}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <View style={styles.icon}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.error}
          />
        </View>
        <Text style={styles.text}>{session.busy ? "Cerrando sesión…" : "Cerrar sesión"}</Text>
        <Ionicons
          name="chevron-forward"
          size={17}
          color={colors.textMuted}
        />
      </Pressable>
      <AppModal
        visible={session.logoutConfirmationVisible}
        variant="confirmation"
        titulo="Cerrar sesión"
        mensaje="¿Seguro que quieres cerrar tu sesión?"
        icon="log-out-outline"
        iconColor={colors.error}
        acceptText="Cerrar sesión"
        cancelText="Cancelar"
        acceptVariant="danger"
        loading={session.busy}
        onAccept={session.logout}
        onCancel={session.cancelLogout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  heading: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    paddingLeft: spacing.xs,
  },
  button: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.errorLight,
  },
  text: {
    flex: 1,
    color: colors.error,
    fontSize: typography.size.button,
    fontWeight: typography.weight.semibold,
  },
  pressed: {
    opacity: 0.6,
  },
});
