/* FILTROS Y CONSULTAS DE REPORTES */

import { useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import type { ReporteQuery } from "../../models/reportes/reporte";
import { getProductosMasVendidos, getReporteResumen } from "../../services/handler/reporteHandler";
import { ApiError } from "../../services/httpClient";
import { useSessionStore } from "../../store/sessionStore";
import { useApiSession } from "../useApiSession";
import { getBusinessToday } from "../../utils/date";

export const useReportes = () => {
  const user = useSessionStore((state) => state.session?.usuario);
  const focused = useIsFocused();
  const [range, setRange] = useState<ReporteQuery>({});
  const [calendarField, setCalendarField] = useState<"desde" | "hasta" | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const today = getBusinessToday();
  const enabled = focused && user?.rol === "ADMINISTRADOR";
  const summary = useQuery({
    queryKey: ["reportes", user?.id, "resumen", range],
    queryFn: async ({ signal }) => {
      const response = await getReporteResumen(range, signal);
      if (!response.data) throw ApiError.invalidResponse();
      return { ...response, data: response.data };
    },
    enabled,
    networkMode: "always",
  });
  const products = useQuery({
    queryKey: ["reportes", user?.id, "productos", range],
    queryFn: async ({ signal }) => {
      const response = await getProductosMasVendidos(range, signal);
      if (!response.data) throw ApiError.invalidResponse();
      return { ...response, data: response.data };
    },
    enabled,
    networkMode: "always",
  });

  useApiSession(summary.error ?? products.error);

  const desde = range.desde ?? summary.data?.data?.desde ?? today;
  const hasta = range.hasta ?? summary.data?.data?.hasta ?? today;

  const openCalendar = (field: "desde" | "hasta") => setCalendarField(field);
  const closeCalendar = () => setCalendarField(null);
  const selectDay = (day: string) => {
    if (day > today || !calendarField) return;
    if (calendarField === "desde") {
      setRange({ desde: day, hasta: day > hasta ? day : hasta });
    } else {
      setRange({ desde: day < desde ? day : desde, hasta: day });
    }
    closeCalendar();
  };

  const resetToday = () => {
    setRange({ desde: today, hasta: today });
  };

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await Promise.all([summary.refetch(), products.refetch()]);
    } finally {
      setRefreshing(false);
    }
  };

  return {
    desde,
    hasta,
    today,
    calendarField,
    openCalendar,
    closeCalendar,
    selectDay,
    resetToday,
    summary: summary.data?.data,
    productos: products.data?.data?.productos ?? [],
    summaryLoading: summary.isPending || refreshing,
    productsLoading: products.isPending || refreshing,
    refreshing,
    summaryError: summary.error ? ApiError.from(summary.error) : null,
    productsError: products.error ? ApiError.from(products.error) : null,
    refresh,
  };
};
