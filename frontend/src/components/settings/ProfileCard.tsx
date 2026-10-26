/* IDENTIDAD VISUAL DEL USUARIO */

import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

type ProfileCardProps = {
  nombre: string;
  rol: string;
};

export const ProfileCard = ({ nombre, rol }: ProfileCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Ionicons
          name="person-outline"
          size={42}
          color={colors.primary}
        />
      </View>
      <View style={styles.identity}>
        <Text style={styles.name}>{nombre}</Text>
        <Text style={styles.role}>{rol}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  identity: {
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
    color: colors.text,
    fontSize: 21,
    fontWeight: typography.weight.semibold,
    textAlign: "center",
  },
  role: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    textAlign: "center",
  },
});
