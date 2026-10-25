/* Muestra la bienvenida del usuario según su rol. */

import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppButton } from "../../components/common/AppButton";
import { ScreenWrapper } from "../../components/layout/ScreenWrapper";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useSession } from "../../hooks/auth/useSession";

const titles: Record<string, string> = {
  ADMINISTRADOR: "Administración",
  CAJERO: "Caja",
  COCINA: "Cocina",
};

export const RoleHomeScreen = () => {
  const { session, busy, logout } = useSession();

  const role = session?.usuario.rol ?? "";
  const title = titles[role] ?? "Acceso no disponible";
  const message = titles[role]
    ? "Bienvenido a Cafetería Lupita"
    : "Tu rol no tiene un inicio disponible. Contacta al administrador.";

  return (
    <ScreenWrapper
      scroll
      contentStyle={styles.content}
    >
      <View style={styles.card}>
        <Text
          accessibilityRole="header"
          style={styles.title}
        >
          {title}
        </Text>
        <Text style={styles.text}>
          Hola, {session?.usuario.nombre} {session?.usuario.apellido}
        </Text>
        <Text style={styles.secondary}>
          {message}
        </Text>
        <AppButton
          title="Cerrar sesión"
          variant="outline"
          onPress={logout}
          loading={busy}
          fullWidth
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center"
  },

  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    gap: spacing.xl,
    paddingVertical: spacing.xxl
  },

  title: {
    color: colors.primary,
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold
  },

  text: {
    color: colors.text,
    fontSize: typography.size.body
  },

  secondary: {
    color: colors.textSecondary,
    fontSize: typography.size.body
  },
});
