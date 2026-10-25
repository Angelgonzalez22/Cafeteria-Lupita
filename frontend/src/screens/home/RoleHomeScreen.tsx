/* INICIO SEGÚN EL ROL */

import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppModal } from "../../components/modals/AppModal";
import { ScreenWrapper } from "../../components/layout/ScreenWrapper";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import { useSession } from "../../hooks/auth/useSession";

const titles: Record<string, string> = {
  ADMINISTRADOR: "Administración",
  CAJERO: "Caja",
  COCINA: "Cocina",
};

export const RoleHomeScreen = () => {
  const {
    session,
    busy,
    logout,
    logoutConfirmationVisible,
    requestLogout,
    cancelLogout,
  } = useSession();

  const role = session?.usuario.rol ?? "";
  const title = titles[role] ?? "Acceso no disponible";
  const message = titles[role]
    ? "Bienvenido a Cafetería Lupita"
    : "Tu rol no tiene un inicio disponible. Contacta al administrador.";

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.identity}>
        <Text
          accessibilityRole="header"
          style={styles.title}
        >
          {title}
        </Text>

        <Text style={styles.text}>
          Hola, {session?.usuario.nombre} {session?.usuario.apellido}
        </Text>
      </View>

      <Pressable
        onPress={requestLogout}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        accessibilityHint="Abre la confirmación para salir de tu cuenta"
        accessibilityState={{ disabled: busy, busy }}
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.pressed,
        ]}
      >
        {busy ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <Ionicons
            name="log-out-outline"
            size={24}
            color={colors.textOnPrimary}
            accessible={false}
          />
        )}
      </Pressable>
    </View>
  );

  const renderWelcome = () => (
    <View style={styles.card}>
      <Text style={styles.secondary}>
        {message}
      </Text>
    </View>
  );

  const renderLogoutModal = () => (
    <AppModal
      visible={logoutConfirmationVisible}
      variant="confirmation"
      titulo="Cerrar sesión"
      mensaje="¿Seguro que quieres cerrar tu sesión?"
      icon="log-out-outline"
      iconColor={colors.error}
      acceptText="Sí, cerrar sesión"
      cancelText="Cancelar"
      acceptVariant="danger"
      loading={busy}
      onAccept={logout}
      onCancel={cancelLogout}
    />
  );

  return (
    <ScreenWrapper contentStyle={styles.content}>
      {renderHeader()}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.welcome}
        showsVerticalScrollIndicator={false}
      >
        {renderWelcome()}
      </ScrollView>

      {renderLogoutModal()}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },

  identity: {
    flex: 1,
    gap: spacing.sm,
  },

  logoutButton: {
    flexShrink: 0,
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.65,
  },

  scroll: {
    flex: 1,
  },

  welcome: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },

  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "flex-start",
    gap: spacing.xl,
    paddingVertical: spacing.base,
  },

  title: {
    color: colors.primary,
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
  },

  text: {
    color: colors.text,
    fontSize: typography.size.body,
  },

  secondary: {
    color: colors.textSecondary,
    fontSize: typography.size.body,
  },
});
