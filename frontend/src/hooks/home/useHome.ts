/* DATOS Y ACCIONES DEL INICIO POR ROL */

import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "@react-navigation/native";

import type { UsuarioResponse } from "../../models/auth/auth";
import type {
  HomeFeedback,
  HomeFilter,
  HomeRole,
  HomeOrdersRequest,
  KitchenActionRequest,
  KitchenConfirmation,
} from "../../models/home/home";
import { getInicioResumen } from "../../services/handler/inicioHandler";
import { cambiarPreparacion, getHomeOrders } from "../../services/handler/homeHandler";
import { validarSesion } from "../../services/handler/sessionHandler";
import { ApiError } from "../../services/httpClient";
import { refreshOfflineData } from "../../services/handler/offlineHandler";
import { usePagination } from "../usePagination";

export const useHome = (user?: UsuarioResponse, recent = true) => {
  const queryClient = useQueryClient();
  const focused = useIsFocused();
  const [filter, setFilter] = useState<HomeFilter>(recent
    ? "todos" : user?.rol === "COCINA" ? "activos" : "sin-pagar");
  const [feedback, setFeedback] = useState<HomeFeedback | null>(null);
  const [active, setActive] = useState(
    AppState.currentState === null || AppState.currentState === "active"
  );
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [preparationConfirmation, setPreparationConfirmation] = useState<KitchenConfirmation | null>(null);
  const preparationLocked = useRef(false);

  const role: HomeRole | null = user?.rol === "ADMINISTRADOR"
    || user?.rol === "CAJERO"
    || user?.rol === "COCINA" ? user.rol : null;

  const scope = ["home", user?.id, role] as const;
  const enabled = !!user && !!role && active && focused;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setActive(state === "active");
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const summaryQuery = useQuery({
    queryKey: [...scope, "summary"],
    queryFn: ({ signal }) => getInicioResumen(signal),
    enabled,
    staleTime: 15000,
    refetchInterval: preparationConfirmation ? false : 30000,
    networkMode: "always",
  });

  const summary = summaryQuery.data?.data ?? null;
  const selectedDay = recent ? summary?.fecha : selectedDate ?? summary?.fecha;
  const ordersScope = JSON.stringify([...scope, recent, filter, selectedDay]);
  const { page, goToPage, pagination, rememberPagination } = usePagination(ordersScope);

  const openCalendar = () => {
    if (summary) setCalendarVisible(true);
  };

  const closeCalendar = () => {
    setCalendarVisible(false);
  };

  const selectDay = (day: string) => {
    if (!summary || day > summary.fecha) return;
    setSelectedDate(day === summary.fecha ? null : day);
    setFilter("todos");
    setCalendarVisible(false);
  };

  const ordersQuery = useQuery({
    queryKey: [...scope, "orders", ordersScope, page],
    queryFn: ({ signal }) => {
      if (!role || !summary || !selectedDay) {
        throw ApiError.invalidResponse();
      }

      const request: HomeOrdersRequest = {
        role,
        filter,
        page,
        desde: selectedDay + summary.desde.slice(10),
        hasta: selectedDay + summary.hasta.slice(10),
        recent,
      };

      return getHomeOrders(request, signal);
    },
    placeholderData: (previous, previousQuery) => previousQuery?.queryKey[4] === ordersScope
      ? previous : undefined,
    enabled: enabled && !!summary,
    staleTime: 15000,
    refetchInterval: preparationConfirmation ? false : 30000,
    networkMode: "always",
  });

  useEffect(() => {
    if (!recent && ordersQuery.data && !ordersQuery.isPlaceholderData) {
      rememberPagination(ordersQuery.data.pagination);
      if (page > Math.max(1, ordersQuery.data.pagination.totalPages)) {
        goToPage(Math.max(1, ordersQuery.data.pagination.totalPages));
      }
    }
  }, [recent, ordersQuery.data, ordersQuery.isPlaceholderData, page, goToPage, rememberPagination]);

  useEffect(() => {
    const failure = summaryQuery.error ?? ordersQuery.error;

    if (failure instanceof ApiError && failure.sesionInvalida) {
      void validarSesion();
    }
  }, [summaryQuery.error, ordersQuery.error]);

  const preparation = useMutation({
    mutationFn: cambiarPreparacion,
    retry: false,
    networkMode: "always",
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["home"] }),
        queryClient.invalidateQueries({ queryKey: ["pedido"] }),
      ]);
    },
    onError: async (error) => {
      const failure = ApiError.from(error);

      setFeedback({
        titulo: failure.titulo,
        mensaje: failure.mensaje,
        status: failure.status,
        kind: "error",
      });

      if (failure.status === 409) {
        await queryClient.invalidateQueries({ queryKey: scope });
      }

      if (failure.sesionInvalida) {
        void validarSesion();
      }
    },
  });

  const refresh = async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await refreshOfflineData();
      await summaryQuery.refetch();
      await queryClient.invalidateQueries({
        queryKey: [...scope, "orders"],
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getPreparationOrder = (id: string, action: KitchenActionRequest["action"]) => {
    if (role !== "COCINA" || ordersQuery.error || ordersQuery.isPlaceholderData) return;
    const order = ordersQuery.data?.data.find((item) => item.id === id);
    if (order?.kind !== "kitchen" || order.cancelado || order.eliminado) return;
    if (action === "iniciar" && order.estadoPreparacion !== "PENDIENTE") return;
    if (action === "finalizar" && order.estadoPreparacion !== "PREPARANDO") return;
    return order;
  };

  const changePreparation = (id: string, action: KitchenActionRequest["action"]) => {
    if (preparation.isPending || preparationLocked.current) return;
    const order = getPreparationOrder(id, action);
    if (order) setPreparationConfirmation({ id, action, numero: order.numero });
  };

  const cancelPreparation = () => {
    setPreparationConfirmation(null);
  };

  const confirmPreparation = async () => {
    const request = preparationConfirmation;
    if (!request || preparation.isPending || preparationLocked.current) return;
    setPreparationConfirmation(null);
    if (!getPreparationOrder(request.id, request.action)) {
      setFeedback({
        titulo: "Pedido actualizado",
        mensaje: "El pedido cambió de estado. Actualiza la lista antes de continuar.",
        kind: "info",
      });
      void queryClient.invalidateQueries({ queryKey: scope });
      return;
    }
    preparationLocked.current = true;
    try {
      await preparation.mutateAsync({ id: request.id, action: request.action });
    } catch {
      return;
    } finally {
      preparationLocked.current = false;
    }
  };

  const dismissFeedback = () => {
    setFeedback(null);
  };

  return {
    role,
    filter,
    setFilter,
    summary,
    selectedDay,
    calendarVisible,
    openCalendar,
    closeCalendar,
    selectDay,
    summaryLoading: summaryQuery.isPending || refreshing,
    summaryError: summaryQuery.error ? ApiError.from(summaryQuery.error) : null,
    orders: ordersQuery.data?.data ?? [],
    pagination: ordersQuery.data?.pagination ?? pagination,
    page,
    goToPage,
    pageLoading: ordersQuery.isFetching,
    ordersLoading: !!summary && (ordersQuery.isPending || ordersQuery.isPlaceholderData || refreshing),
    ordersError: ordersQuery.error ? ApiError.from(ordersQuery.error) : null,
    refreshing,
    busyOrderId: preparation.isPending ? preparation.variables.id : null,
    preparationBusy: preparation.isPending,
    feedback,
    refresh,
    changePreparation,
    preparationConfirmation,
    confirmPreparation,
    cancelPreparation,
    dismissFeedback,
  };
};
