/*
 * Pantalla de inicio de sesión de Cafetería Lupita.
 * Permite autenticar empleados mediante cédula y contraseña.
 */

import { useRef } from "react";
import { Controller } from "react-hook-form";
import {
  StyleSheet,
  Text,
  View,
  type TextInputInstance,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../components/common/AppButton";
import { AppInput } from "../../components/common/AppInput";
import { AppModal } from "../../components/common/AppModal";
import { ScreenWrapper } from "../../components/layout/ScreenWrapper";

import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import { useLogin } from "../../hooks/auth/useLogin";

export const LoginScreen = () => {
  const {
    form,
    submit,
    loading,
    canSubmit,
    error,
    dismissError,
  } = useLogin();

  const passwordRef = useRef<TextInputInstance>(null);

  const handleSubmit = () => {
    void submit();
  };

  const handleFocusPassword = () => {
    passwordRef.current?.focus();
  };

  const renderHeader = () => (
    <View style={styles.heading}>
      <Ionicons
        name="cafe-outline"
        size={48}
        color={colors.primary}
        accessible={false}
      />

      <Text
        accessibilityRole="header"
        style={styles.title}
      >
        Cafetería Lupita
      </Text>

      <Text style={styles.subtitle}>
        Inicia sesión para continuar
      </Text>
    </View>
  );

  const renderCedulaInput = () => (
    <Controller
      control={form.control}
      name="cedula"
      render={({ field, fieldState }) => (
        <AppInput
          ref={field.ref}
          label="Cédula"
          placeholder="1-111-1111"
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
          disabled={loading}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={handleFocusPassword}
        />
      )}
    />
  );

  const renderPasswordInput = () => (
    <Controller
      control={form.control}
      name="contrasena"
      render={({ field, fieldState }) => (
        <AppInput
          ref={(input) => {
            field.ref(input);
            passwordRef.current = input;
          }}
          label="Contraseña"
          password
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
          disabled={loading}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
      )}
    />
  );

  const renderForm = () => (
    <View style={styles.form}>
      {renderHeader()}

      {renderCedulaInput()}

      {renderPasswordInput()}

      <AppButton
        title="Iniciar sesión"
        onPress={handleSubmit}
        loading={loading}
        disabled={!canSubmit}
        fullWidth
      />
    </View>
  );

  const renderErrorModal = () => (
    <AppModal
      visible={!!error}
      status={error?.status}
      titulo={error?.titulo ?? ""}
      mensaje={error?.mensaje ?? ""}
      onAccept={dismissError}
    />
  );

  return (
    <ScreenWrapper
      scroll
      keyboardAvoiding
      contentStyle={styles.content}
    >
      {renderForm()}
      {renderErrorModal()}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: spacing.xxxl * 2,
  },

  form: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    gap: spacing.xl,
    paddingVertical: spacing.xxl,
  },

  heading: {
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },

  title: {
    color: colors.text,
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
    textAlign: "center",
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.body,
    textAlign: "center",
  },
});
