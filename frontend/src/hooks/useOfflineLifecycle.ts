/* ARRANQUE Y SINCRONIZACIÓN AL RECUPERAR CONEXIÓN */

import { useEffect } from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "../store/sessionStore";
import { useOfflineStore } from "../store/offlineStore";
import { dismissOfflineSyncNotice, refreshOfflineState, restorePendingOfflineNotice, supportsOffline, synchronizeOffline } from "../services/handler/offlineHandler";
import { ApiError } from "../services/httpClient";

export const useOfflineLifecycle = () => {
  const session = useSessionStore((state) => state.session);
  const revision = useOfflineStore((state) => state.revision);
  const notice = useOfflineStore((state) => state.syncNotice);
  const owner = useOfflineStore((state) => state.userId);
  const queryClient = useQueryClient();
  const userId = session?.usuario.id;
  const enabled = supportsOffline && !!session && ["ADMINISTRADOR", "CAJERO"].includes(session.usuario.rol);

  useEffect(() => {
    if (!enabled || !userId) {
      useOfflineStore.setState({ userId: null, initialized: false, authorized: false, released: false, releasePending: false, updatedAt: null,
        pending: 0, conflicts: 0, error: null, syncing: false, syncNotice: null });
      return;
    }
    useOfflineStore.setState({ userId, initialized: false, authorized: false, released: false, releasePending: false, updatedAt: null, pending: 0, conflicts: 0, error: null, syncNotice: null });
    let mounted = true;
    const run = () => {
      if (!mounted || (AppState.currentState !== null && AppState.currentState !== "active")) return;
      void synchronizeOffline().catch(() => undefined);
    };
    void restorePendingOfflineNotice().then(() => refreshOfflineState(userId)).then(run).catch((error: unknown) => {
      if (mounted) useOfflineStore.setState({ error: ApiError.from(error).mensaje });
    });
    const network = NetInfo.addEventListener((state) => {
      const connected = !!state.isConnected && state.isInternetReachable !== false;
      useOfflineStore.setState({ connected });
      if (connected) run();
    });
    const app = AppState.addEventListener("change", (state) => { if (state === "active") run(); });
    const timer = setInterval(run, 30000);
    return () => { mounted = false; network(); app.remove(); clearInterval(timer); };
  }, [enabled, userId]);

  useEffect(() => {
    if (!enabled) return;
    void queryClient.invalidateQueries({ queryKey: ["home"] });
    void queryClient.invalidateQueries({ queryKey: ["pedido"] });
    void queryClient.invalidateQueries({ queryKey: ["productos"] });
    void queryClient.invalidateQueries({ queryKey: ["reportes"] });
  }, [enabled, revision, queryClient]);

  const dismissNotice = () => {
    if (!notice || owner !== userId) return;
    void dismissOfflineSyncNotice(notice.id).catch((error: unknown) => {
      if (useSessionStore.getState().session?.usuario.id === userId) {
        useOfflineStore.setState({ error: ApiError.from(error).mensaje });
      }
    });
  };

  return { notice: enabled && owner === userId ? notice : null, dismissNotice };
};
