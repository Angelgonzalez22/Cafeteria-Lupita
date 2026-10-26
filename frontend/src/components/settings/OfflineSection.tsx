/* GESTIÓN DEL DISPOSITIVO Y CONFLICTOS OFFLINE */

import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../common/AppButton";
import { AppInput } from "../common/AppInput";
import { OfflineStatus } from "../common/OfflineStatus";
import { AppModal } from "../modals/AppModal";
import { useOfflineSettings } from "../../hooks/settings/useOfflineSettings";
import type { OfflineOperation, OfflineResult } from "../../models/common/offline";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

export const OfflineSection = () => {
  const offline = useOfflineSettings();
  if (!offline.visible) return null;

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Trabajo sin conexión</Text>
      <OfflineStatus detailed />
      <AppButton
        title="Sincronizar y actualizar datos"
        onPress={() => offline.act("sync")}
        disabled={!offline.state.connected || offline.busy || offline.state.released}
        loading={offline.busy}
        fullWidth
      />
      {offline.state.releasePending ? (
        <AppButton
          title="Reintentar liberación del dispositivo"
          onPress={() => offline.act("release")}
          disabled={!offline.state.connected || offline.busy}
          fullWidth
        />
      ) : offline.state.authorized && !offline.state.released ? (
        <AppButton
          title="Liberar dispositivo para cambiar de teléfono"
          onPress={offline.requestRelease}
          disabled={!offline.state.connected || offline.busy || !!offline.state.pending || !!offline.state.conflicts}
          fullWidth
        />
      ) : (
        <AppButton
          title="Autorizar este dispositivo"
          onPress={() => offline.act("authorize")}
          disabled={!offline.state.connected || offline.busy}
          fullWidth
        />
      )}
      {!!offline.error && <Text style={styles.warning}>{offline.error}</Text>}
      {!!offline.conflicts.length && <Text style={styles.title}>Operaciones por revisar</Text>}
      {offline.conflicts.map((conflict) => {
        const operation = JSON.parse(conflict.contenido) as OfflineOperation;
        const result = JSON.parse(conflict.resultado) as OfflineResult;
        return (
          <View key={conflict.id} style={styles.card}>
            <Text style={styles.title}>{operation.crear?.referencia ?? `Pedido ${operation.pedidoId.slice(0, 8).toUpperCase()}`}</Text>
            <Text style={styles.text}>{result.mensaje}</Text>
            <Text style={styles.text}>{operation.pagoId ? "Incluye un cobro en efectivo." : "Sin cobro en esta operación."}</Text>
            {offline.admin ? (
              <AppButton
                title="Registrar revisión"
                onPress={() => offline.select(conflict.id)}
                disabled={offline.busy || !offline.state.connected}
                fullWidth
              />
            ) : <Text style={styles.warning}>Solicita a administración que revise esta operación.</Text>}
          </View>
        );
      })}
      {!!offline.selectedId && (
        <View style={styles.card}>
          <Text style={styles.text}>Verifica si el cobro fue un registro repetido o si se recibió efectivo dos veces. Esta revisión deja constancia; no registra ni anula pagos.</Text>
          <AppInput
            label="Resultado de la revisión"
            value={offline.reason}
            onChangeText={offline.setReason}
            maxLength={255}
            multiline
            disabled={offline.busy}
          />
          <AppButton
            title="Guardar revisión"
            onPress={() => offline.act("resolve")}
            disabled={!offline.reason.trim() || offline.busy || !offline.state.connected}
            fullWidth
          />
          <AppButton
            title="Cancelar"
            onPress={() => offline.select(null)}
            disabled={offline.busy}
            fullWidth
          />
        </View>
      )}
      <AppModal
        visible={offline.releaseConfirmation}
        variant="confirmation"
        titulo="Cambiar de dispositivo"
        mensaje="Se enviarán las operaciones pendientes y este teléfono dejará de registrar ventas offline. Después podrás autorizar el nuevo teléfono."
        acceptText="Liberar dispositivo"
        onAccept={() => offline.act("release")}
        onCancel={offline.cancelRelease}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  card: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.surface, borderRadius: 8 },
  title: { color: colors.text, fontSize: typography.size.body, fontWeight: typography.weight.semibold },
  text: { color: colors.textSecondary, fontSize: typography.size.caption },
  warning: { color: colors.warning, fontSize: typography.size.caption },
});
