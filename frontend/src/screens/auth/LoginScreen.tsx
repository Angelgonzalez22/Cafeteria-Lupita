/* INICIO DE SESIÓN */

import { useRef, type ComponentRef } from "react";
import { Controller } from "react-hook-form";
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  type TextInputInstance,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../components/common/AppButton";
import { AppInput } from "../../components/common/AppInput";
import { AppPinInput } from "../../components/common/AppPinInput";
import { AppModal } from "../../components/modals/AppModal";
import { ScreenWrapper } from "../../components/layout/ScreenWrapper";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import { useLogin } from "../../hooks/auth/useLogin";
import { useKeyboardVisible } from "../../hooks/useKeyboardVisible";

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
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const pinFocused = useRef(false);
  const keyboardVisible = useKeyboardVisible();

  const handleSubmit = () => {
    void submit();
  };

  const handleFocusPassword = () => {
    passwordRef.current?.focus();
  };

  const handleScrollLayout = () => {
    if (keyboardVisible && pinFocused.current) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  };

  const renderHeader = () => (
    <View style={[styles.heading, keyboardVisible && styles.compactHeading]}>
      <View
        pointerEvents="none"
        style={styles.logoFrame}
      >
        <Ionicons
          name="cafe-outline"
          size={40}
          color={colors.primary}
          accessible={false}
        />
      </View>

      <Text
        accessibilityRole="header"
        style={styles.title}
      >
        Cafetería Lupita
      </Text>

      <Text style={styles.subtitle}>
        Tu cafetería, en orden.
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
        <AppPinInput
          ref={(input) => {
            field.ref(input);
            passwordRef.current = input;
          }}
          label="PIN de acceso"
          length={6}
          value={field.value}
          onChangeText={field.onChange}
          onFocus={() => {
            pinFocused.current = true;
            scrollRef.current?.scrollToEnd({ animated: true });
          }}
          onBlur={() => {
            pinFocused.current = false;
            field.onBlur();
          }}
          error={field.value.length >= 6 ? fieldState.error?.message : undefined}
          disabled={loading}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
      )}
    />
  );

  const renderForm = () => (
    <View style={[styles.form, keyboardVisible && styles.compactForm]}>
      {renderHeader()}

      {renderCedulaInput()}

      {renderPasswordInput()}

      {renderSubmitButton()}
    </View>
  );

  const renderSubmitButton = () => (
      <AppButton
        title="Iniciar sesión"
        onPress={handleSubmit}
        loading={loading}
        disabled={!canSubmit}
        style={styles.submitButton}
        fullWidth
      />
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
      keyboardAvoiding
      contentStyle={styles.screen}
    >
      <ScrollView
        ref={scrollRef}
        onLayout={handleScrollLayout}
        style={styles.scroll}
        contentContainerStyle={[styles.content, keyboardVisible && styles.keyboardContent]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {renderForm()}
      </ScrollView>

      {renderErrorModal()}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

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

  keyboardContent: {
    justifyContent: "flex-start",
    paddingBottom: spacing.base,
  },

  compactForm: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },

  compactHeading: {
    marginBottom: 0,
  },

  heading: {
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  logoFrame: {
    width: 88,
    height: 88,
    borderRadius: radius.xl + spacing.xs,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },

  title: {
    color: colors.text,
    fontSize: typography.size.title,
    fontWeight: typography.weight.semibold,
    textAlign: "center",
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.button,
    textAlign: "center",
    lineHeight: 22,
  },

  submitButton: {
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
});
