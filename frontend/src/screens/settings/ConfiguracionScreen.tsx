/* CONFIGURACIÓN Y CIERRE DE SESIÓN */

import { ScrollView, StyleSheet } from "react-native";

import { ScreenWrapper } from "../../components/layout/ScreenWrapper";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { ProfileCard } from "../../components/settings/ProfileCard";
import { LogoutSection } from "../../components/settings/LogoutSection";
import { OfflineSection } from "../../components/settings/OfflineSection";
import { spacing } from "../../constants/spacing";
import { useProfile } from "../../hooks/settings/useProfile";
import { useResponsive } from "../../hooks/useResponsive";

export const ConfiguracionScreen = () => {
  const profile = useProfile();
  const { horizontalPadding } = useResponsive();

  return (
    <ScreenWrapper
      padded={false}
      edges={[]}
      contentStyle={styles.root}
    >
      <SectionHeader title="Configuración" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard
          nombre={profile.nombreCompleto}
          rol={profile.rol}
        />
        <OfflineSection />
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
});
