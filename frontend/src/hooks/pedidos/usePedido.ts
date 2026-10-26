/* CONSULTA DEL DETALLE DE UN PEDIDO */

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "@react-navigation/native";
import { randomUUID } from "expo-crypto";
import { getPedido } from "../../services/handler/pedidoHandler";
import { getPedidoCocina } from "../../services/handler/cocinaHandler";
import type { PedidoVista } from "../../models/pedidos/pedido";
import { ApiError } from "../../services/httpClient";
import { useSessionStore } from "../../store/sessionStore";
import { useApiSession } from "../useApiSession";
import { cambiarPreparacion } from "../../services/handler/homeHandler";
import { cobrarPedido } from "../../services/handler/pagoHandler";
import type { CrearPagoRequest } from "../../models/pagos/pago";
import type { PedidoAction, PedidoFeedback } from "../../models/pedidos/operacion";
import { cacheDownloadedPedido, offlineError, operarPedidoLocal, refreshOfflineData, supportsOffline } from "../../services/handler/offlineHandler";
import { useOfflineStore } from "../../store/offlineStore";

export const usePedido = (id: string) => {
  const user = useSessionStore((state) => state.session?.usuario);
  const connected = useOfflineStore((state) => state.connected);
  const authorized = useOfflineStore((state) => state.authorized && !state.released);
  const focused = useIsFocused();
  const queryClient = useQueryClient();
  const key = ["pedido", user?.id, user?.rol, id];
  const [refreshing, setRefreshing] = useState(false);
  const [confirmation, setConfirmation] = useState<PedidoAction | null>(null);
  const [feedback, setFeedback] = useState<PedidoFeedback | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<CrearPagoRequest | null>(null);
  const locked = useRef(false);
  const query = useQuery({
    queryKey: key,
    queryFn: async ({ signal }): Promise<PedidoVista> => {
      if (user?.rol === "COCINA") {
        const response = await getPedidoCocina(id, signal);
        if (!response.data) {
          throw ApiError.invalidResponse();
        }
        return { kind: "kitchen", pedido: response.data };
      }

      const response = await getPedido(id, signal);
      if (!response.data) {
        throw ApiError.invalidResponse();
      }
      return { kind: "sale", pedido: response.data };
    },
    enabled: !!user && focused,
    refetchInterval: confirmation ? false : 30000,
    networkMode: "always",
  });

  useApiSession(query.error);

  const vista = query.data;
  const inactive = vista?.kind === "sale" ? !!vista.pedido.canceladoEn
    : !!vista?.pedido.cancelado || !!vista?.pedido.eliminado;
  const canPay = vista?.kind === "sale" && !inactive
    && ["ADMINISTRADOR", "CAJERO"].includes(user?.rol ?? "")
    && (vista.pedido.creadoPor === user?.id || (user?.rol === "ADMINISTRADOR" && connected))
    && vista.pedido.syncStatus !== "conflicto"
    && (!supportsOffline || connected || authorized)
    && vista.pedido.estadoPago === "PENDIENTE";
  const canStart = vista?.kind === "kitchen" && user?.rol === "COCINA" && !inactive
    && vista.pedido.estadoPreparacion === "PENDIENTE";
  const canFinish = !inactive && ((vista?.kind === "kitchen" && user?.rol === "COCINA"
    && vista.pedido.estadoPreparacion === "PREPARANDO")
    || (supportsOffline && authorized && vista?.kind === "sale" && vista.pedido.creadoPor === user?.id
      && vista.pedido.syncStatus !== "conflicto" && vista.pedido.estadoPreparacion !== "LISTO"));

  if (paymentRequest && vista?.kind === "sale" && vista.pedido.estadoPago === "PAGADO") {
    setPaymentRequest(null);
  }

  const mutation = useMutation({
    mutationFn: async (action: PedidoAction) => {
      const revision = useSessionStore.getState().revision;
      if (supportsOffline && authorized && vista?.kind === "sale" && vista.pedido.creadoPor === user?.id) {
        if (action === "iniciar") return;
        const request = action === "cobrar" ? paymentRequest ?? { id: randomUUID(), pedidoId: id } : null;
        if (request) setPaymentRequest(request);
        const pedido = await operarPedidoLocal(id, action, request?.id);
        if (useSessionStore.getState().revision !== revision) return;
        await queryClient.cancelQueries({ queryKey: key });
        queryClient.setQueryData<PedidoVista>(key, { kind: "sale", pedido });
        setPaymentRequest(null);
        await queryClient.invalidateQueries({ queryKey: ["home"] });
        return;
      }
      if (action === "cobrar") {
        if (supportsOffline && !connected) throw offlineError("Conéctate para autorizar este dispositivo o cobrar un pedido de otro usuario.");
        const request = paymentRequest ?? { id: randomUUID(), pedidoId: id,
          totalEsperado: vista?.kind === "sale" ? vista.pedido.total : undefined,
          versionPedido: vista?.kind === "sale" ? vista.pedido.version : undefined,
          confirmarPedidoAjeno: user?.rol === "ADMINISTRADOR" && vista?.kind === "sale" && vista.pedido.creadoPor !== user.id };
        setPaymentRequest(request);
        const response = await cobrarPedido(request);
        if (useSessionStore.getState().revision !== revision) return;
        if (!response.data) throw ApiError.invalidResponse();
        if (vista?.kind === "sale") await cacheDownloadedPedido({ ...vista.pedido, estadoPago: "PAGADO" }, response.data.creadoEn, user?.id);
        await queryClient.cancelQueries({ queryKey: key });
        queryClient.setQueryData<PedidoVista>(key, (current) => current?.kind === "sale"
          ? { ...current, pedido: { ...current.pedido, estadoPago: "PAGADO" } } : current);
        setPaymentRequest(null);
      } else {
        const response = await cambiarPreparacion({ id, action });
        if (useSessionStore.getState().revision !== revision) return;
        if (!response.data || response.data.id !== id) throw ApiError.invalidResponse();
        await queryClient.cancelQueries({ queryKey: key });
        queryClient.setQueryData<PedidoVista>(key, { kind: "kitchen", pedido: response.data });
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["home"] }),
        queryClient.invalidateQueries({ queryKey: ["reportes"] }),
        queryClient.invalidateQueries({ queryKey: key }),
      ]);
    },
    retry: false,
    networkMode: "always",
    onError: (error, action) => {
      const failure = ApiError.from(error);
      setFeedback({ titulo: failure.titulo, mensaje: failure.mensaje, status: failure.status });
      if (action === "cobrar" && failure.status && [400, 401, 403, 404, 409, 422].includes(failure.status)) {
        setPaymentRequest(null);
      }
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({ queryKey: ["home"] });
    },
  });

  useApiSession(mutation.error);

  const canAct = !mutation.isPending && !query.isFetching && !query.error;
  const requestAction = (action: PedidoAction) => {
    if (!canAct || locked.current) return;
    if ((action === "cobrar" && canPay) || (action === "iniciar" && canStart)
      || (action === "finalizar" && canFinish)) setConfirmation(action);
  };

  const confirmAction = async () => {
    const action = confirmation;
    if (!action || !canAct || locked.current) return;
    const allowed = action === "cobrar" ? canPay : action === "iniciar" ? canStart : canFinish;
    setConfirmation(null);
    if (!allowed) return;
    locked.current = true;
    try {
      await mutation.mutateAsync(action);
    } catch {
      return;
    } finally {
      locked.current = false;
    }
  };

  const refresh = async () => {
    if (refreshing || mutation.isPending) return;
    setRefreshing(true);
    try {
      await refreshOfflineData();
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return {
    userId: user?.id,
    kitchen: user?.rol === "COCINA",
    vista: query.data,
    loading: query.isPending || refreshing,
    refreshing,
    error: query.error ? ApiError.from(query.error) : null,
    refresh,
    canPay,
    canStart,
    canFinish,
    canAct,
    busy: mutation.isPending,
    pendingPayment: !!paymentRequest,
    confirmation,
    requestAction,
    confirmAction,
    cancelAction: () => setConfirmation(null),
    feedback,
    dismissFeedback: () => setFeedback(null),
  };
};
