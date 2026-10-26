/* ACCIONES DE SINCRONIZACIÓN Y REVISIÓN ADMINISTRATIVA */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "../../store/sessionStore";
import { useOfflineStore } from "../../store/offlineStore";
import { autorizarDispositivo, getOfflineConflicts, liberarDispositivo, resolveOfflineConflict, supportsOffline, synchronizeOffline } from "../../services/handler/offlineHandler";
import { ApiError } from "../../services/httpClient";
import { useApiSession } from "../useApiSession";

export const useOfflineSettings = () => {
  const user = useSessionStore((state) => state.session?.usuario);
  const state = useOfflineStore();
  const client = useQueryClient();
  const [reason, setReason] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [releaseConfirmation, setReleaseConfirmation] = useState(false);
  const visible = supportsOffline && !!user && ["ADMINISTRADOR", "CAJERO"].includes(user.rol);
  const query = useQuery({
    queryKey: ["offline-conflicts", user?.id],
    queryFn: getOfflineConflicts,
    enabled: visible && state.connected,
    refetchInterval: 30000,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: async (action: "sync" | "release" | "authorize" | "resolve") => {
      if (action === "release") await liberarDispositivo();
      else if (action === "authorize") await autorizarDispositivo();
      else if (action === "resolve" && selectedId && reason.trim()) {
        await resolveOfflineConflict(selectedId, reason.trim());
        setSelectedId(null);
        setReason("");
        await synchronizeOffline();
      } else await synchronizeOffline();
      await client.invalidateQueries({ queryKey: ["offline-conflicts"] });
    },
    retry: false,
    networkMode: "always",
  });
  useApiSession(query.error);
  useApiSession(mutation.error);

  const act = (action: "sync" | "release" | "authorize" | "resolve") => {
    setReleaseConfirmation(false);
    mutation.mutate(action);
  };

  const error = mutation.error ? ApiError.from(mutation.error).mensaje : query.error ? ApiError.from(query.error).mensaje : null;

  return { visible, admin: user?.rol === "ADMINISTRADOR", state, conflicts: query.data?.data ?? [],
    error: error === state.error ? null : error,
    busy: mutation.isPending || state.syncing, reason, setReason, selectedId,
    select: (id: string | null) => { setSelectedId(id); setReason(""); },
    releaseConfirmation, requestRelease: () => setReleaseConfirmation(true), cancelRelease: () => setReleaseConfirmation(false), act };
};
