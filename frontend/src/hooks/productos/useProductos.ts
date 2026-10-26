/* BÚSQUEDA Y PAGINACIÓN DE PRODUCTOS */

import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import type { ProductoQuery } from "../../models/productos/producto";
import { getProductos } from "../../services/handler/productoHandler";
import { refreshOfflineData } from "../../services/handler/offlineHandler";
import { ApiError } from "../../services/httpClient";
import { useSessionStore } from "../../store/sessionStore";
import { useApiSession } from "../useApiSession";
import { usePagination } from "../usePagination";

export const useProductos = (soloActivos = false, pageSize = 20) => {
  const user = useSessionStore((state) => state.session?.usuario);
  const focused = useIsFocused();
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const scope = JSON.stringify([user?.id, soloActivos, pageSize, name]);
  const { page, goToPage, pagination, rememberPagination } = usePagination(scope);

  useEffect(() => {
    const timer = setTimeout(() => setName(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useQuery({
    queryKey: ["productos", scope, page],
    queryFn: ({ signal }) => {
      const request: ProductoQuery = {
        page,
        pageSize,
        nombre: name || undefined,
        activo: soloActivos ? true : undefined,
        eliminados: false,
      };

      return getProductos(request, signal);
    },
    placeholderData: (previous, previousQuery) => previousQuery?.queryKey[1] === scope
      ? previous : undefined,
    enabled: focused && !!user && ["ADMINISTRADOR", "CAJERO"].includes(user.rol),
    staleTime: 15000,
    networkMode: "always",
  });

  useApiSession(query.error);
  const typing = search.trim() !== name;
  const searching = typing || query.isFetching;

  useEffect(() => {
    if (query.data && !query.isPlaceholderData) {
      rememberPagination(query.data.pagination);
      if (page > Math.max(1, query.data.pagination.totalPages)) {
        goToPage(Math.max(1, query.data.pagination.totalPages));
      }
    }
  }, [query.data, query.isPlaceholderData, page, goToPage, rememberPagination]);

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refreshOfflineData();
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return {
    search,
    setSearch,
    searching,
    productos: query.data?.data ?? [],
    pagination: query.data?.pagination ?? pagination,
    page,
    goToPage,
    pageLoading: query.isFetching,
    loading: typing || query.isPending || query.isPlaceholderData || refreshing,
    refreshing,
    error: !typing && query.error ? ApiError.from(query.error) : null,
    refresh,
  };
};
