/* Mantiene la sesión al iniciar y volver a la app. */

import { useEffect } from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import {
  cerrarSesion,
  restaurarSesion,
  validarSesion,
} from "../../services/handler/sessionHandler";
import { useSessionStore } from "../../store/sessionStore";

export const useSessionLifecycle = () => {
  const queryClient = useQueryClient();
  const session = useSessionStore((state) => state.session);
  const busy = useSessionStore((state) => state.busy);
  useEffect(() => {
    void restaurarSesion();
    const app = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        void validarSesion();
      }
    });
    const unsubscribeNetwork = NetInfo.addEventListener((network) => {
      if (network.isConnected && network.isInternetReachable !== false) {
        void validarSesion();
      }
    });
    const unsubscribeSession = useSessionStore.subscribe((next, previous) => {
      if (next.revision !== previous.revision) {
        void queryClient.cancelQueries();
        queryClient.clear();
      }
    });

    return () => {
      app.remove();
      unsubscribeNetwork();
      unsubscribeSession();
    };
  }, [queryClient]);
  useEffect(() => {
    if (!session || busy) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const remaining = Date.parse(session.expiraEn) - Date.now();
      if (remaining <= 0) {
        void cerrarSesion(true);

        return;
      }

      timer = setTimeout(schedule, Math.min(remaining, 2147483647));
    };

    schedule();

    return () => clearTimeout(timer);
  }, [session, busy]);
};
