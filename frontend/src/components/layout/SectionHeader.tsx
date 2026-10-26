/* CABECERA DE SECCIONES */

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

type SectionHeaderProps = {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  inset?: boolean;
};

export const SectionHeader = ({ title, onBack, onClose, inset = false }: SectionHeaderProps) => {
  return (
    <SafeAreaView
      edges={inset ? [] : ["top", "left", "right"]}
      style={styles.container}
    >
      <View style={styles.content}>
        {onBack && (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={({ pressed }) => [styles.action, styles.back, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        )}

        <Text
          accessibilityRole="header"
          numberOfLines={1}
          style={styles.title}
        >
          {title}
        </Text>

        {!!onClose && (
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar nueva venta"
            style={({ pressed }) => [styles.action, styles.close, pressed && styles.pressed]}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  content: {
    height: 58,
    justifyContent: "center",
    paddingHorizontal: 56,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: typography.weight.semibold,
    textAlign: "center",
  },
  action: {
    position: "absolute",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    left: spacing.sm,
  },
  close: {
    right: spacing.sm,
  },
  pressed: {
    opacity: 0.55,
  },
});
