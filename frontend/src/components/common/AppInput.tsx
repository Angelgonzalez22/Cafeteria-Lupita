/* CAMPO DE TEXTO REUTILIZABLE */

import {
  forwardRef,
  useId,
  useState,
} from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { TextInputInstance, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

export interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
  help?: string;
  disabled?: boolean;
  password?: boolean;
}

export const AppInput = forwardRef<TextInputInstance, AppInputProps>(function AppInput(
  {
    label,
    error,
    help,
    disabled = false,
    password = false,
    style,
    editable,
    secureTextEntry,
    ...props
  },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  const blocked = disabled || editable === false;

  return (
    <View style={styles.group}>
      <Text
        nativeID={id}
        style={styles.label}
      >
        {label}
      </Text>
      <View style={[styles.field, !!error && styles.invalid, blocked && styles.disabled]}>
        <TextInput
          {...props}
          ref={ref}
          editable={!blocked}
          accessibilityLabel={props.accessibilityLabel ?? label}
          accessibilityLabelledBy={id}
          accessibilityHint={error ?? help ?? props.accessibilityHint}
          accessibilityState={{
            ...props.accessibilityState,
            disabled: blocked
          }}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={password ? !visible : secureTextEntry}
          style={[styles.input, style]}
        />
        {password && (
          <Pressable
            onPress={() => setVisible((value) => !value)}
            disabled={blocked}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            accessibilityState={{
              disabled: blocked
            }}
            style={styles.toggle}
          >
            <Ionicons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={24}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {!!(error || help) && (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.help, !!error && styles.error]}
        >
          {error || help}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm
  },

  label: {
    color: colors.text,
    fontSize: typography.size.body - 2,
    fontWeight: typography.weight.medium
  },

  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background
  },

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.size.body - 2
  },

  invalid: {
    borderColor: colors.error
  },

  disabled: {
    backgroundColor: colors.disabledBackground
  },

  toggle: {
    minHeight: 48,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center"
  },

  help: {
    color: colors.textSecondary,
    fontSize: typography.size.caption
  },

  error: {
    color: colors.error
  },
});
