/* ENVÍO MANUAL DE LOS REGISTROS PENDIENTES */

import { useMutation } from "@tanstack/react-query";
import { synchronizeOffline } from "../services/handler/offlineHandler";
import { useApiSession } from "./useApiSession";

export const useOfflineSyncAction = () => {
  const mutation = useMutation({
    mutationFn: synchronizeOffline,
    retry: false,
    networkMode: "always",
  });

  useApiSession(mutation.error);

  return {
    send: () => mutation.mutate(),
    sending: mutation.isPending,
  };
};
