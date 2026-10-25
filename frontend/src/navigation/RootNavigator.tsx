/* NAVEGACIÓN SEGÚN LA SESIÓN */

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppButton } from "../components/common/AppButton";
import { AppModal } from "../components/modals/AppModal";
import { ScreenWrapper } from "../components/layout/ScreenWrapper";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";

import { useSessionLifecycle } from "../hooks/auth/useSessionLifecycle";
import { useAppStartup } from "../hooks/useAppStartup";
import type { RootStackParamList } from "../models/auth/navigation";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RoleHomeScreen } from "../screens/home/RoleHomeScreen";
import { SplashScreen } from "../screens/startup/SplashScreen";
import {
  restaurarSesion,
  dismissSessionError,
} from "../services/handler/sessionHandler";
import { useSessionStore } from "../store/sessionStore";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  useSessionLifecycle();

  const {
    session,
    ready,
    busy,
    error,
  } = useSessionStore();

  const { showSplash, handleLayout } = useAppStartup(ready, busy);

  const role = session?.usuario.rol;
  const route = role === "ADMINISTRADOR"
    ? "Administrador"
    : role === "CAJERO"
      ? "Cajero"
      : role === "COCINA"
        ? "Cocina"
        : "SinAcceso";

  const handleRestore = () => {
    void restaurarSesion();
  };

  const renderLoading = () => (
    <ScreenWrapper contentStyle={styles.loading}>
      <View style={styles.message}>
        {busy ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        ) : (
          <>
            <Text style={styles.text}>
              No se pudo recuperar la sesión.
            </Text>

            <AppButton
              title="Reintentar"
              onPress={handleRestore}
            />
          </>
        )}
      </View>
    </ScreenWrapper>
  );

  const renderNavigation = () => (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen
            key={session.usuario.id + route}
            name={route}
            component={RoleHomeScreen}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );

  const renderErrorModal = () => (
    <AppModal
      visible={!!error}
      status={error?.status}
      titulo={error?.titulo ?? ""}
      mensaje={error?.mensaje ?? ""}
      onAccept={dismissSessionError}
    />
  );

  const renderContent = () => {
    if (showSplash) {
      return <SplashScreen />;
    }

    if (!ready) {
      return renderLoading();
    }

    return renderNavigation();
  };

  return (
    <View
      style={styles.root}
      onLayout={handleLayout}
    >
      <StatusBar style="dark" />
      {renderContent()}
      {!showSplash && renderErrorModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  loading: {
    justifyContent: "center",
    alignItems: "center",
  },

  message: {
    gap: spacing.xl,
    alignItems: "center",
  },

  text: {
    color: colors.text,
    fontSize: typography.size.body,
    textAlign: "center",
  },
});
