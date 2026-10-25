/* CAMPO PARA PIN NUMÉRICO */

import { forwardRef, useId, useRef, useState } from "react";
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

type AppPinInputProps = Omit<
  TextInputProps,
  "value" | "onChangeText" | "secureTextEntry" | "maxLength" | "keyboardType" | "inputMode"
> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
};

export const AppPinInput = forwardRef<TextInputInstance, AppPinInputProps>(
  function AppPinInput({
    label,
    value,
    onChangeText,
    length = 6,
    error,
    disabled = false,
    editable,
    onFocus,
    onBlur,
    style,
    ...props
  }, ref) {
    const inputRef = useRef<TextInputInstance | null>(null);
    const labelId = useId();
    const [focused, setFocused] = useState(false);
    const [visible, setVisible] = useState(false);

    const blocked = disabled || editable === false;
    const activeIndex = Math.min(value.length, length - 1);

    const handleChange = (text: string) => {
      onChangeText(text.replace(/\D/g, "").slice(0, length));
    };

    const renderToggle = () => (
      <Pressable
        onPress={() => setVisible((current) => !current)}
        disabled={blocked}
        accessibilityRole="button"
        accessibilityLabel={visible ? "Ocultar PIN" : "Mostrar PIN"}
        accessibilityState={{ disabled: blocked }}
        style={styles.toggle}
      >
        <Ionicons
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={24}
          color={colors.textSecondary}
        />
      </Pressable>
    );

    const renderCells = () => (
      <Pressable
        onPress={() => inputRef.current?.focus()}
        disabled={blocked}
        accessible={false}
        style={styles.code}
      >
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.cells}
        >
          {Array.from({ length }, (_, index) => (
            <View
              key={index}
              style={[
                styles.cell,
                blocked && styles.disabled,
                focused && index === activeIndex && styles.active,
                !!error && styles.invalid,
              ]}
            >
              <Text style={styles.digit}>
                {value[index] ? (visible ? value[index] : "•") : ""}
              </Text>
            </View>
          ))}
        </View>

        <TextInput
          {...props}
          ref={(input) => {
            inputRef.current = input;

            if (typeof ref === "function") {
              ref(input);
            } else if (ref) {
              ref.current = input;
            }
          }}
          value={value}
          pointerEvents="none"
          onChangeText={handleChange}
          editable={!blocked}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={length}
          secureTextEntry={!visible}
          caretHidden
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel={props.accessibilityLabel ?? label}
          accessibilityLabelledBy={labelId}
          accessibilityHint={error ?? "PIN de " + length + " números"}
          accessibilityState={{ disabled: blocked }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.nativeInput, style]}
        />
      </Pressable>
    );

    return (
      <View style={styles.group}>
        <View style={styles.heading}>
          <Text
            nativeID={labelId}
            style={styles.label}
          >
            {label}
          </Text>

          {renderToggle()}
        </View>

        {renderCells()}

        {!!error && (
          <Text
            accessibilityLiveRegion="polite"
            style={styles.error}
          >
            {error}
          </Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },

  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    flex: 1,
    color: colors.text,
    fontSize: typography.size.body - 2,
    fontWeight: typography.weight.medium,
  },

  toggle: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  code: {
    position: "relative",
  },

  cells: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  cell: {
    flex: 1,
    minWidth: 0,
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  active: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  invalid: {
    borderColor: colors.error,
  },

  disabled: {
    backgroundColor: colors.disabledBackground,
  },

  digit: {
    color: colors.text,
    fontSize: typography.size.title - spacing.xs,
    fontWeight: typography.weight.semibold,
  },

  nativeInput: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.01,
    color: colors.transparent,
    backgroundColor: colors.transparent,
    padding: 0,
  },

  error: {
    color: colors.error,
    fontSize: typography.size.caption,
  },
});
