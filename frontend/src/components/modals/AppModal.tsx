/* MODAL REUTILIZABLE DE MENSAJES Y CONFIRMACIÓN */

import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { AppButton } from "../common/AppButton";

type ModalContentProps = {
  visible: boolean;
  status?: number;
  titulo: string;
  mensaje: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
  iconColor?: string;
  acceptText?: string;
  cancelText?: string;
  acceptVariant?: ComponentProps<typeof AppButton>["variant"];
  loading?: boolean;
  onAccept: () => void;
};

export type AppModalProps = ModalContentProps & (
  | {
    variant: "confirmation";
    onCancel: () => void;
  }
  | {
    variant?: "message";
    onCancel?: never;
  }
);

export const AppModal = ({
  visible,
  status,
  titulo,
  mensaje,
  variant = "message",
  icon,
  iconColor,
  acceptText = "Aceptar",
  cancelText = "Cancelar",
  acceptVariant = "primary",
  loading = false,
  onAccept,
  onCancel,
}: AppModalProps) => {
  const confirmation = variant === "confirmation";
  const success = status !== undefined && status >= 200 && status < 300;
  const warning = status !== undefined && status >= 400 && status < 500;
  const defaultColor = confirmation
    ? colors.primary
    : success ? colors.success : warning ? colors.warning : colors.error;

  const defaultIcon = confirmation
    ? "help-circle-outline"
    : success
      ? "checkmark-circle-outline"
      : warning ? "alert-circle-outline" : "close-circle-outline";

  const handleAccept = () => {
    if (!loading) {
      onAccept();
    }
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    if (confirmation) {
      onCancel?.();
      return;
    }

    onAccept();
  };

  const renderActions = () => (
    <View style={styles.actions}>
      {confirmation && (
        <AppButton
          title={cancelText}
          variant="outline"
          onPress={handleClose}
          disabled={loading}
          style={styles.action}
        />
      )}

      <AppButton
        title={acceptText}
        variant={acceptVariant}
        onPress={handleAccept}
        loading={loading}
        style={styles.action}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View
          accessibilityViewIsModal
          style={styles.card}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            bounces={false}
          >
            <Ionicons
              accessible={false}
              name={icon ?? defaultIcon}
              size={52}
              color={iconColor ?? defaultColor}
            />

            <Text
              accessibilityRole="header"
              style={styles.title}
            >
              {titulo}
            </Text>

            <Text style={styles.message}>
              {mensaje}
            </Text>

            {renderActions()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.backdrop,
  },

  card: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "85%",
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.xl,
    gap: spacing.base,
    alignItems: "center",
  },

  title: {
    color: colors.text,
    fontSize: typography.size.title,
    fontWeight: typography.weight.semibold,
    textAlign: "center",
  },

  message: {
    color: colors.textSecondary,
    fontSize: typography.size.body,
    textAlign: "center",
  },

  actions: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  action: {
    flexGrow: 1,
    flexBasis: 140,
  },
});
