/* Muestra el estado, título y mensaje de una operación. */

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
import { AppButton } from "./AppButton";

export interface AppModalProps {
  visible: boolean;
  status?: number;
  titulo: string;
  mensaje: string;
  onAccept: () => void;
}

export const AppModal = ({
  visible,
  status,
  titulo,
  mensaje,
  onAccept,
}: AppModalProps) => {
  const success = status !== undefined && status >= 200 && status < 300;
  const warning = status !== undefined && status >= 400 && status < 500;
  const color = success ? colors.success : warning ? colors.warning : colors.error;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onAccept}
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
              name={success ? "checkmark-circle-outline" : warning ? "alert-circle-outline" : "close-circle-outline"}
              size={56}
              color={color}
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
            <AppButton
              title="Aceptar"
              onPress={onAccept}
              fullWidth
            />
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
    backgroundColor: colors.backdrop
  },

  card: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "85%",
    borderRadius: radius.lg,
    backgroundColor: colors.background
  },

  content: {
    padding: spacing.xl,
    gap: spacing.base,
    alignItems: "center"
  },

  title: {
    color: colors.text,
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
    textAlign: "center"
  },

  message: {
    color: colors.textSecondary,
    fontSize: typography.size.body,
    textAlign: "center"
  },
});
