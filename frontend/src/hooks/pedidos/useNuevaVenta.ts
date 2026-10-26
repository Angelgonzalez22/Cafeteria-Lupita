/* FORMULARIO Y REGISTRO DE NUEVA VENTA */

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";

import type { CrearPedidoRequest, PedidoResponse } from "../../models/pedidos/pedido";
import type { NuevaVentaForm } from "../../models/pedidos/validation";
import { nuevaVentaSchema } from "../../models/pedidos/validation";
import type { ProductoResponse, VentaLinea } from "../../models/productos/producto";
import type { RegistrarVentaRequest } from "../../models/pedidos/operacion";
import { cobrarPedido } from "../../services/handler/pagoHandler";
import { crearPedido } from "../../services/handler/pedidoHandler";
import { ApiError } from "../../services/httpClient";
import { useSessionStore } from "../../store/sessionStore";
import { useApiSession } from "../useApiSession";
import { canSellOffline, guardarVentaLocal, offlineError, prepareOfflineData, supportsOffline } from "../../services/handler/offlineHandler";
import { useOfflineStore } from "../../store/offlineStore";

export const useNuevaVenta = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.session?.usuario.id);
  const [lineas, setLineas] = useState<VentaLinea[]>([]);
  const [request, setRequest] = useState<RegistrarVentaRequest | null>(null);
  const [guardado, setGuardado] = useState<PedidoResponse | null>(null);
  const [step, setStep] = useState<"productos" | "datos">("productos");
  const locked = useRef(false);
  const registrado = useRef<PedidoResponse | null>(null);
  const attemptedOnline = useRef(false);

  const form = useForm<NuevaVentaForm>({
    resolver: zodResolver(nuevaVentaSchema),
    mode: "onChange",
    defaultValues: { referencia: "", nombreCliente: "" },
  });

  const mutation = useMutation({
    mutationFn: async (operation: RegistrarVentaRequest): Promise<PedidoResponse> => {
      if (supportsOffline && !attemptedOnline.current) {
        await prepareOfflineData();
        if (await canSellOffline()) {
          registrado.current = await guardarVentaLocal(operation, lineas);
          return registrado.current;
        }
      }
      if (supportsOffline && !useOfflineStore.getState().connected) {
        if (attemptedOnline.current) {
          throw offlineError("Este pedido ya se envió antes de perder la conexión. Recupera la conexión para confirmar el mismo registro sin duplicarlo.", "ONLINE_CONFIRMATION_REQUIRED");
        }
        throw offlineError("La preparación automática de los datos no se completó mientras había conexión. Recupera la conexión una vez para terminarla; luego podrás registrar ventas offline.", "OFFLINE_NOT_READY");
      }
      if (!registrado.current) {
        attemptedOnline.current = true;
        const response = await crearPedido(operation.pedido);
        if (!response.data) throw ApiError.invalidResponse();
        registrado.current = response.data;
      }
      const pedido = registrado.current;
      if (operation.cobrar && pedido.estadoPago !== "PAGADO") {
        if (useSessionStore.getState().session?.usuario.id !== userId) {
          throw ApiError.invalidResponse();
        }
        await cobrarPedido({ id: operation.pagoId, pedidoId: pedido.id, totalEsperado: pedido.total, versionPedido: pedido.version });
        registrado.current = { ...pedido, estadoPago: "PAGADO" };
      }
      return registrado.current;
    },
    retry: false,
    networkMode: "always",
  });

  useApiSession(mutation.error);

  const blocked = mutation.isPending || !!request || !!guardado;
  const totalCentavos = lineas.reduce((sum, item) => {
    return sum + Math.round(item.producto.precio * 100) * item.cantidad;
  }, 0);
  const unidades = lineas.reduce((sum, item) => sum + item.cantidad, 0);
  const canContinue = lineas.length > 0 && totalCentavos <= 999999999999;

  const continuar = () => {
    if (canContinue && !blocked) setStep("datos");
  };

  const volverAProductos = () => {
    if (!blocked) setStep("productos");
  };

  const cambiarCantidad = (producto: ProductoResponse, delta: number) => {
    if (blocked || locked.current) return;

    setLineas((previous) => {
      const current = previous.find((item) => item.producto.id === producto.id);
      const cantidad = (current?.cantidad ?? 0) + delta;
      if (cantidad < 1) return previous.filter((item) => item.producto.id !== producto.id);
      if (cantidad > 2147483647 || (!current && previous.length >= 100)) return previous;
      if (!current) return [...previous, { producto, cantidad }];

      return previous.map((item) => item.producto.id === producto.id
        ? { ...item, cantidad } : item);
    });
  };

  const enviar = async (payload: RegistrarVentaRequest) => {
    if (locked.current || mutation.isPending || guardado) return;
    locked.current = true;
    setRequest(payload);

    try {
      const response = await mutation.mutateAsync(payload);
      if (useSessionStore.getState().session?.usuario.id !== userId) return;

      setGuardado(response);
    } catch (error) {
      const failure = ApiError.from(error);
      if (!registrado.current && ((failure.status && [400, 401, 403, 404, 422].includes(failure.status))
        || failure.codigo === "OFFLINE_NOT_READY" || failure.codigo === "OFFLINE_CATALOG_REQUIRED")) {
        setRequest(null);
        if (failure.status && [400, 401, 403, 404, 422].includes(failure.status)) attemptedOnline.current = false;
      }
    } finally {
      locked.current = false;
      if (registrado.current) {
        void queryClient.invalidateQueries({ queryKey: ["home"] });
        void queryClient.invalidateQueries({ queryKey: ["reportes"] });
      }
    }
  };

  const submit = async (cobrar = false) => {
    if (request) {
      await enviar(request);
      return;
    }

    await form.handleSubmit(async (values) => {
      if (!lineas.length || totalCentavos > 999999999999) return;
      const payload: CrearPedidoRequest = {
        id: randomUUID(),
        referencia: values.referencia,
        nombreCliente: values.nombreCliente || undefined,
        detalles: lineas.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
        })),
      };

      await enviar({ pedido: payload, cobrar, pagoId: randomUUID() });
    })();
  };

  return {
    form,
    step,
    unidades,
    canContinue,
    continuar,
    volverAProductos,
    lineas,
    total: totalCentavos / 100,
    blocked,
    loading: mutation.isPending,
    pendienteConfirmacion: !!request && !guardado,
    guardado,
    cobrarSeleccionado: request?.cobrar ?? false,
    dirty: !guardado && (form.formState.isDirty || lineas.length > 0),
    canSubmit: !mutation.isPending && !guardado && (!!request
      || (form.formState.isValid && lineas.length > 0 && totalCentavos <= 999999999999)),
    error: mutation.error ? ApiError.from(mutation.error) : null,
    dismissError: mutation.reset,
    cambiarCantidad,
    submit,
  };
};
