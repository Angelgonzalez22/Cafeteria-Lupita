/* CICLO DE VIDA DE LA SESIÓN */

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
import { sessionTiming } from "../../constants/session";

export const useSessionLifecycle = () => {
  const queryClient = useQueryClient();
  const session = useSessionStore((state) => state.session);
  const busy = useSessionStore((state) => state.busy);
  useEffect(() => {
    void restaurarSesion();
    let connected = false;
    const app = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        void validarSesion();
      }
    });
    const unsubscribeNetwork = NetInfo.addEventListener((network) => {
      connected = !!network.isConnected && network.isInternetReachable !== false;
      if (connected) {
        void validarSesion();
      }
    });
    const renewal = setInterval(() => {
      if (!connected || AppState.currentState !== "active") return;
      const currentSession = useSessionStore.getState().session;
      if (currentSession && Date.parse(currentSession.expiraEn) - Date.now() <= sessionTiming.renewBeforeMs) {
        void validarSesion();
      }
    }, sessionTiming.checkIntervalMs);
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
      clearInterval(renewal);
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
