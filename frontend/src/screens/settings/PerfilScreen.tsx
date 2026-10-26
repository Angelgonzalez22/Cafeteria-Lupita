/* INFORMACIÓN DEL PERFIL DE USUARIO */

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenWrapper } from "../../components/layout/ScreenWrapper";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { ProfileCard } from "../../components/settings/ProfileCard";
import { LogoutSection } from "../../components/settings/LogoutSection";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useProfile } from "../../hooks/settings/useProfile";
import { useResponsive } from "../../hooks/useResponsive";
import type { RootStackParamList } from "../../models/auth/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Perfil">;

export const PerfilScreen = ({ navigation }: Props) => {
  const profile = useProfile();
  const { horizontalPadding } = useResponsive();

  return (
    <ScreenWrapper
      padded={false}
      edges={["bottom"]}
      contentStyle={styles.root}
    >
      <SectionHeader
        title="Mi perfil"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard
          nombre={profile.nombreCompleto}
          rol={profile.rol}
        />
        <Text style={styles.heading}>Información de la cuenta</Text>
        <View style={styles.details}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{profile.nombre}</Text>
          </View>
          <View style={[styles.field, styles.separator]}>
            <Text style={styles.label}>Apellido</Text>
            <Text style={styles.value}>{profile.apellido}</Text>
          </View>
          <View style={[styles.field, styles.separator]}>
            <Text style={styles.label}>Rol</Text>
            <Text style={styles.value}>{profile.rol}</Text>
          </View>
        </View>
        <LogoutSection />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  root: {
    maxWidth: "100%",
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingVertical: spacing.xl,
    gap: spacing.base,
  },
  heading: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    marginTop: spacing.sm,
  },
  details: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.base,
  },
  field: {
    paddingVertical: spacing.base,
    gap: spacing.sm,
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },
  value: {
    color: colors.text,
    fontSize: typography.size.button,
    fontWeight: typography.weight.medium,
  },
});
