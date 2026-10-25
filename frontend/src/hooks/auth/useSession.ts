/* ACCESO Y CIERRE DE SESIÓN */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cerrarSesion } from "../../services/handler/sessionHandler";
import { useSessionStore } from "../../store/sessionStore";

export const useSession = () => {
  const session = useSessionStore((state) => state.session);
  const busy = useSessionStore((state) => state.busy);
  const queryClient = useQueryClient();
  const [logoutConfirmationVisible, setLogoutConfirmationVisible] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (useSessionStore.getState().busy) {
        return;
      }

      const result = cerrarSesion();

      await queryClient.cancelQueries();
      queryClient.clear();

      await result;
    },
    retry: false,
    networkMode: "always",
  });

  const logout = () => {
    if (useSessionStore.getState().busy || mutation.isPending) {
      return;
    }

    setLogoutConfirmationVisible(false);
    mutation.mutate();
  };

  const requestLogout = () => {
    if (!useSessionStore.getState().busy && !mutation.isPending) {
      setLogoutConfirmationVisible(true);
    }
  };

  const cancelLogout = () => {
    setLogoutConfirmationVisible(false);
  };

  return {
    session,
    busy: busy || mutation.isPending,
    logout,
    logoutConfirmationVisible,
    requestLogout,
    cancelLogout,
  };
};
