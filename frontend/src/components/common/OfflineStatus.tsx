/* ESTADO COMPARTIDO DE CONEXIÓN Y SINCRONIZACIÓN */

import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppModal } from "../modals/AppModal";
import { useSessionStore } from "../../store/sessionStore";
import { useOfflineStore } from "../../store/offlineStore";
import { supportsOffline } from "../../services/handler/offlineHandler";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useOfflineSyncAction } from "../../hooks/useOfflineSyncAction";

export const OfflineStatus = ({ detailed = false, header = false }: { detailed?: boolean; header?: boolean }) => {
  const user = useSessionStore((state) => state.session?.usuario);
  const state = useOfflineStore();
  const syncAction = useOfflineSyncAction();
  const [visible, setVisible] = useState(false);
  const [connectionVisible, setConnectionVisible] = useState(false);
  if (!supportsOffline || !user || user.rol === "COCINA" || state.userId !== user.id) return null;

  const warning = !!state.error || state.conflicts > 0 || state.releasePending;
  const label = !state.connected ? "Sin conexión"
    : state.conflicts ? `${state.conflicts} por revisar`
      : state.releasePending ? "Cambio de dispositivo pendiente"
        : state.error ? "Sincronización pendiente"
          : state.pending ? state.syncing ? "Enviando pedidos…" : `${state.pending} pendientes de enviar`
            : "Datos actualizados";
  const updated = state.updatedAt
    ? `Última actualización: ${new Date(state.updatedAt).toLocaleString("es-PA", { timeZone: "America/Panama" })}`
    : state.syncing ? "Preparando los datos para trabajar sin conexión."
      : state.connected ? "Todavía no se han preparado los datos para trabajar sin conexión."
        : "Necesitas una primera conexión para descargar los datos.";
  const message = [
    !state.connected ? "Estás trabajando sin conexión." : "Tienes conexión a la red.",
    state.pending ? `${state.pending === 1 ? "Hay un registro guardado pendiente" : `Hay ${state.pending} registros guardados pendientes`} de enviar. Se envían automáticamente al recuperar la conexión; también puedes sincronizar ahora.`
      : state.updatedAt && !state.error ? "No hay registros pendientes de enviar." : null,
    state.conflicts ? `${state.conflicts} operaciones requieren revisión en Configuración.` : null,
    state.error,
    state.releasePending ? "Reintenta la liberación del dispositivo desde Configuración." : null,
    state.released && !state.releasePending ? "Este teléfono tiene desactivadas las ventas sin conexión." : null,
    updated,
  ].filter(Boolean).join("\n\n");

  if (header) {
    return (
      <View style={styles.headerActions}>
        <Pressable
          onPress={() => setConnectionVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={state.connected ? "Con conexión. Ver estado de la conexión" : "Sin conexión. Ver estado de la conexión"}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
        >
          <Ionicons name="wifi-outline" size={23} color={colors.textOnPrimary} />
          {!state.connected && <View style={styles.wifiSlash} />}
        </Pressable>
        <Pressable
          onPress={() => setVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`Sincronización: ${state.syncing ? "en curso" : label}. Ver detalles`}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
        >
          <Ionicons name="sync-outline" size={23} color={colors.textOnPrimary} />
          {(warning || state.pending > 0) && <View style={styles.syncDot} />}
        </Pressable>
        <AppModal
          visible={connectionVisible}
          titulo={state.connected ? "Con conexión" : "Sin conexión"}
          mensaje={state.connected ? "El teléfono tiene conexión a la red. Puedes consultar el envío de pedidos desde el icono de sincronización."
            : state.authorized && !state.released ? "Puedes seguir trabajando con los datos descargados. Las operaciones guardadas se enviarán cuando vuelva la conexión."
              : "Este teléfono necesita descargar y preparar sus datos con conexión antes de registrar ventas offline."}
          icon="wifi-outline"
          iconColor={colors.primary}
          onAccept={() => setConnectionVisible(false)}
        />
        {state.connected && !state.released ? (
          <AppModal
            visible={visible}
            variant="confirmation"
            titulo="Sincronización"
            mensaje={message}
            icon={warning ? "alert-circle-outline" : "sync-outline"}
            iconColor={warning ? colors.warning : colors.primary}
            acceptText="Sincronizar ahora"
            cancelText="Cerrar"
            loading={state.syncing || syncAction.sending}
            onAccept={syncAction.send}
            onCancel={() => setVisible(false)}
          />
        ) : (
          <AppModal
            visible={visible}
            titulo="Sincronización"
            mensaje={message}
            icon="sync-outline"
            iconColor={colors.primary}
            acceptText="Cerrar"
            onAccept={() => setVisible(false)}
          />
        )}
      </View>
    );
  }

  if (detailed) {
    return (
      <View style={styles.details} accessibilityLiveRegion="polite">
        <Text style={styles.title}>{state.connected ? "Con conexión" : "Sin conexión"}</Text>
        <Text style={styles.text}>{updated}</Text>
        {!!state.pending && <Text style={styles.text}>{state.pending === 1 ? "Un registro pendiente" : `${state.pending} registros pendientes`} de enviar. Los reportes se actualizan al sincronizar.</Text>}
        {!!state.conflicts && <Text style={styles.warning}>{state.conflicts} operaciones requieren revisión.</Text>}
        {!!state.error && <Text style={styles.warning}>{state.error}</Text>}
        {state.released && <Text style={styles.text}>{state.releasePending ? "La liberación del dispositivo está pendiente de confirmar." : "Las ventas sin conexión están desactivadas en este teléfono."}</Text>}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  headerActions: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
  headerButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  wifiSlash: { position: "absolute", width: 28, height: 2, borderRadius: 1, backgroundColor: colors.textOnPrimary, transform: [{ rotate: "45deg" }] },
  syncDot: { position: "absolute", right: 7, top: 7, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.warningLight },
  pressed: { opacity: 0.7 },
  details: { padding: spacing.md, gap: spacing.sm, borderRadius: 12, backgroundColor: colors.surface },
  title: { color: colors.text, fontSize: typography.size.caption, fontWeight: typography.weight.semibold },
  text: { color: colors.textSecondary, fontSize: typography.size.caption },
  warning: { color: colors.warning, fontSize: typography.size.caption },
});
