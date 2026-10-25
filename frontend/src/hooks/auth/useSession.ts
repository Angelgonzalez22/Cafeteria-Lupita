/*
 * Expone la sesión y el cierre de sesión de la interfaz.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cerrarSesion } from "../../services/handler/sessionHandler";
import { useSessionStore } from "../../store/sessionStore";

export const useSession = () => {
  const session = useSessionStore((state) => state.session);
  const busy = useSessionStore((state) => state.busy);
  const queryClient = useQueryClient();

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
    mutation.mutate();
  };

  return {
    session,
    busy: busy || mutation.isPending,
    logout,
  };
};