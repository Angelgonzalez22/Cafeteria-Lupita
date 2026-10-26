/* COORDINACIÓN DE VENTAS LOCALES Y SINCRONIZACIÓN */

import { Platform } from "react-native";
import { randomUUID } from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";
import type { OfflineConflict, OfflineOperation, OfflineResult, OfflineSnapshot, OfflineSyncNotice, OutboxRow, StoredOrder } from "../../models/common/offline";
import type { ApiResponse } from "../../models/common/apiResponse";
import type { PedidoResponse, PedidoQuery, PedidosResponse } from "../../models/pedidos/pedido";
import type { ProductosResponse, ProductoQuery, ProductoResponse, VentaLinea } from "../../models/productos/producto";
import type { RegistrarVentaRequest } from "../../models/pedidos/operacion";
import type { InicioResponse } from "../../models/home/home";
import type { PaginatedResponse } from "../../models/common/pagination";
import { useSessionStore } from "../../store/sessionStore";
import { useOfflineStore } from "../../store/offlineStore";
import { offlineScope, putMeta, putOrder, readMeta, readMetaFrom, readOrders, readOutbox, saveSnapshot, writeOffline } from "../../storage/offlineDatabase";
import { OfflineInstance } from "../api/OfflineService";
import { ApiError } from "../httpClient";
import { getBusinessToday } from "../../utils/date";
import { validarSesion } from "./sessionHandler";
import { confirmedOfflineOrders } from "../../utils/offlineSync";

export const supportsOffline = Platform.OS !== "web";
let running: Promise<void> | null = null;
let runningUser: string | null = null;

export const getOfflineConflicts = async (): Promise<ApiResponse<OfflineConflict[]>> => {
  const { userId } = localContext();
  const response = await OfflineInstance.conflictos(userId);
  sessionFor(userId);
  return response;
};

export const resolveOfflineConflict = async (id: string, motivo: string): Promise<void> => {
  const { userId } = localContext();
  await OfflineInstance.resolver(id, motivo, userId);
  sessionFor(userId);
};

export const offlineError = (mensaje: string, codigo?: string): ApiError => new ApiError({ tipo: "storage", titulo: "Operación offline", mensaje, codigo });

const sessionFor = (expected?: string) => {
  const session = useSessionStore.getState().session;
  if (!session || (expected && session.usuario.id !== expected) || Date.parse(session.expiraEn) <= Date.now()) {
    throw offlineError("Inicia sesión con el usuario que registró estas operaciones para continuar.");
  }
  return session;
};

export const localContext = () => {
  const session = sessionFor();
  return { session, userId: session.usuario.id, scope: offlineScope(session.usuario.id) };
};

export const deviceId = async (): Promise<string> => writeOffline(async (db) => {
  const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM offline_meta WHERE scope = 'installation' AND key = 'device'");
  if (row) return JSON.parse(row.value) as string;
  const id = randomUUID();
  await putMeta(db, "installation", "device", id);
  return id;
});

export const refreshOfflineState = async (userId: string): Promise<void> => {
  const scope = offlineScope(userId);
  const [snapshot, authorized, released, releasePending, rows, syncNotice] = await Promise.all([
    readMeta<OfflineSnapshot>(scope, "snapshot"), readMeta<boolean>(scope, "authorized"), readMeta<boolean>(scope, "released"), readMeta<boolean>(scope, "releasePending"), readOutbox(scope), readMeta<OfflineSyncNotice>(scope, "syncNotice"),
  ]);
  if (useSessionStore.getState().session?.usuario.id !== userId) return;
  useOfflineStore.setState((state) => ({ userId, initialized: true, authorized: !!authorized, released: !!released, releasePending: !!releasePending,
    updatedAt: snapshot?.actualizadoEn ?? null, pending: rows.filter((row) => row.estado === "pendiente").length,
    conflicts: rows.filter((row) => row.estado === "conflicto").length, syncNotice, revision: state.revision + 1 }));
};

const rememberOfflineOperations = async (db: SQLiteDatabase, scope: string, operationIds: string[]): Promise<void> => {
  if (!operationIds.length) return;
  const previous = await readMetaFrom<string[]>(db, scope, "offlineNoticeOperationIds") ?? [];
  await putMeta(db, scope, "offlineNoticeOperationIds", [...new Set([...previous, ...operationIds])]);
};

export const restorePendingOfflineNotice = async (): Promise<void> => {
  const { scope, userId } = localContext();
  await writeOffline(async (db) => {
    sessionFor(userId);
    const rows = await db.getAllAsync<{ id: string }>("SELECT id FROM offline_outbox WHERE scope = ? AND estado = 'pendiente'", scope);
    await rememberOfflineOperations(db, scope, rows.map((row) => row.id));
  });
};

const publishOfflineNotice = async (scope: string, userId: string): Promise<void> => {
  await writeOffline(async (db) => {
    sessionFor(userId);
    const ids = await readMetaFrom<string[]>(db, scope, "offlineNoticeOperationIds") ?? [];
    if (!ids.length) return;
    const rows = await db.getAllAsync<Pick<OutboxRow, "id" | "pedidoId" | "estado">>("SELECT id, pedidoId, estado FROM offline_outbox WHERE scope = ?", scope);
    const orders = confirmedOfflineOrders(ids, rows);
    if (orders === null) return;
    await putMeta(db, scope, "offlineNoticeOperationIds", []);
    if (!orders.length) return;
    const previous = await readMetaFrom<OfflineSyncNotice>(db, scope, "syncNotice");
    const notice: OfflineSyncNotice = { id: randomUUID(), pedidoIds: [...new Set([...(previous?.pedidoIds ?? []), ...orders])] };
    await putMeta(db, scope, "syncNotice", notice);
  });
};

export const dismissOfflineSyncNotice = async (id: string): Promise<void> => {
  const { scope, userId } = localContext();
  await writeOffline(async (db) => {
    sessionFor(userId);
    const notice = await readMetaFrom<OfflineSyncNotice>(db, scope, "syncNotice");
    if (notice?.id === id) await putMeta(db, scope, "syncNotice", null);
  });
  if (useSessionStore.getState().session?.usuario.id === userId && useOfflineStore.getState().syncNotice?.id === id) {
    useOfflineStore.setState({ syncNotice: null });
  }
};

const decorate = (order: StoredOrder): PedidoResponse => ({ ...order.pedido, creadoPor: order.creadoPor,
  syncStatus: order.estado, syncMessage: order.mensaje });

export const localPedido = async (id: string): Promise<PedidoResponse | null> => {
  if (!supportsOffline) return null;
  const { scope, userId, session } = localContext();
  const orders = await readOrders(scope);
  sessionFor(userId);
  const order = orders.find((row) => row.pedido.id === id);
  return order && (session.usuario.rol === "ADMINISTRADOR" || order.creadoPor === userId) ? decorate(order) : null;
};

export const cacheDownloadedPedido = async (pedido: PedidoResponse, paidAt?: string, paidBy?: string): Promise<void> => {
  if (!supportsOffline || !pedido.creadoPor) return;
  const { scope, userId } = localContext();
  await writeOffline(async (db) => {
    sessionFor(userId);
    const dirty = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM offline_outbox WHERE scope = ? AND pedidoId = ? AND estado IN ('pendiente', 'conflicto')", scope, pedido.id);
    if (dirty?.count) return;
    const current = await db.getFirstAsync<{ value: string }>("SELECT value FROM offline_orders WHERE scope = ? AND id = ?", scope, pedido.id);
    const stored = current ? JSON.parse(current.value) as StoredOrder : null;
    await putOrder(db, scope, { pedido, creadoPor: pedido.creadoPor!, estado: "sincronizado",
      pagadoEn: paidAt ?? stored?.pagadoEn ?? null, pagadoPor: paidBy ?? stored?.pagadoPor ?? null });
  });
  await refreshOfflineState(userId);
};

const page = <T>(items: T[], query: { page?: number; pageSize?: number }): PaginatedResponse<T> => {
  const currentPage = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  return { status: 200, titulo: "Datos locales", mensaje: "Datos guardados en este dispositivo.",
    data: items.slice((currentPage - 1) * pageSize, currentPage * pageSize), pagination: {
      currentPage, pageSize, totalItems: items.length, totalPages: Math.ceil(items.length / pageSize),
      hasNextPage: currentPage * pageSize < items.length, hasPreviousPage: currentPage > 1,
    } };
};

export const localProductos = async (query: ProductoQuery): Promise<ProductosResponse | null> => {
  if (!supportsOffline) return null;
  const { scope, userId } = localContext();
  const snapshot = await readMeta<OfflineSnapshot>(scope, "snapshot");
  sessionFor(userId);
  if (!snapshot) return null;
  const name = query.nombre?.toLocaleLowerCase() ?? "";
  return page(snapshot.productos.filter((product) => query.activo !== false && product.nombre.toLocaleLowerCase().includes(name))
    .map((product) => ({ ...product, activo: true, eliminado: false, catalogoId: snapshot.catalogoId })), query);
};

export const localPedidos = async (query: PedidoQuery): Promise<PedidosResponse | null> => {
  if (!supportsOffline) return null;
  const { scope, userId, session } = localContext();
  if (!await readMeta(scope, "snapshot")) return null;
  const orders = await readOrders(scope);
  sessionFor(userId);
  const data = orders.filter((row) => ((!query.soloMios && session.usuario.rol === "ADMINISTRADOR") || row.creadoPor === userId)
    && (!query.estadoPago || row.pedido.estadoPago === query.estadoPago)
    && (!query.estadoPreparacion || row.pedido.estadoPreparacion === query.estadoPreparacion)
    && (!query.fechaInicial || new Date(row.pedido.creadoEn) >= new Date(query.fechaInicial))
    && (!query.fechaFinal || new Date(row.pedido.creadoEn) <= new Date(query.fechaFinal)))
    .sort((a, b) => Date.parse(b.pedido.creadoEn) - Date.parse(a.pedido.creadoEn))
    .map((row) => ({ ...decorate(row), cancelado: !!row.pedido.canceladoEn, eliminado: false }));
  return page(data, query);
};

export const localResumen = async (): Promise<InicioResponse | null> => {
  if (!supportsOffline) return null;
  const { scope, session, userId } = localContext();
  if (!await readMeta(scope, "snapshot")) return null;
  const rows = (await readOrders(scope)).filter((row) => session.usuario.rol === "ADMINISTRADOR" || row.creadoPor === userId);
  sessionFor(userId);
  const today = getBusinessToday();
  const desde = `${today}T00:00:00-05:00`;
  const hasta = `${today}T23:59:59.999-05:00`;
  const isToday = (date: string) => Date.parse(date) >= Date.parse(desde) && Date.parse(date) <= Date.parse(hasta);
  const orders = rows.filter((row) => isToday(row.pedido.creadoEn) && !row.pedido.canceladoEn && row.estado !== "conflicto");
  const paid = rows.filter((row) => !row.pedido.canceladoEn && row.pagadoEn && isToday(row.pagadoEn) && row.pedido.estadoPago === "PAGADO" && row.estado !== "conflicto"
    && (session.usuario.rol === "ADMINISTRADOR" || row.pagadoPor === userId));
  return { status: 200, titulo: "Resumen local", mensaje: "Incluye las operaciones guardadas en este dispositivo.", data: {
    rol: session.usuario.rol === "ADMINISTRADOR" ? "ADMINISTRADOR" : "CAJERO", fecha: today, desde, hasta,
    pedidosRealizados: orders.length, totalCobrado: paid.reduce((total, row) => total + row.pedido.total, 0),
    pedidosPagados: paid.length, pendientesPago: orders.filter((row) => row.pedido.estadoPago === "PENDIENTE").length,
    pendientesPreparacion: orders.filter((row) => row.pedido.estadoPreparacion === "PENDIENTE").length,
    preparando: orders.filter((row) => row.pedido.estadoPreparacion === "PREPARANDO").length,
  } };
};

const requireAuthorized = async (scope: string, db?: SQLiteDatabase): Promise<void> => {
  const authorized = db ? await readMetaFrom<boolean>(db, scope, "authorized") : await readMeta<boolean>(scope, "authorized");
  const released = db ? await readMetaFrom<boolean>(db, scope, "released") : await readMeta<boolean>(scope, "released");
  if (!authorized || released) {
    throw offlineError("Todavía no se pudo completar la preparación automática de este teléfono. Recupera la conexión para terminarla; después podrás registrar ventas sin Internet.", "OFFLINE_NOT_READY");
  }
};

export const canSellOffline = async (): Promise<boolean> => {
  if (!supportsOffline) return false;
  const { scope, userId } = localContext();
  const [authorized, released, snapshot] = await Promise.all([
    readMeta<boolean>(scope, "authorized"), readMeta<boolean>(scope, "released"), readMeta<OfflineSnapshot>(scope, "snapshot"),
  ]);
  sessionFor(userId);
  return !!authorized && !released && !!snapshot;
};

export const prepareOfflineData = async (): Promise<void> => {
  if (!supportsOffline || await canSellOffline() || !useOfflineStore.getState().connected) return;
  await synchronizeOffline().catch(() => undefined);
};

export const guardarVentaLocal = async (request: RegistrarVentaRequest, lines: VentaLinea[]): Promise<PedidoResponse> => {
  const { scope, userId, session } = localContext();
  await requireAuthorized(scope);
  const snapshot = await readMeta<OfflineSnapshot>(scope, "snapshot");
  const catalogoId = lines[0]?.producto.catalogoId ?? snapshot?.catalogoId;
  if (!catalogoId) throw offlineError("Actualiza el catálogo antes de registrar esta venta.", "OFFLINE_CATALOG_REQUIRED");
  const products = await readMeta<ProductoResponse[]>(scope, `catalog:${catalogoId}`);
  if (!products || lines.some((line) => !products.some((product) => product.id === line.producto.id && product.precio === line.producto.precio))) {
    throw offlineError("El catálogo cambió durante la selección. Vuelve a seleccionar los productos antes de confirmar.", "OFFLINE_CATALOG_REQUIRED");
  }
  const occurred = new Date().toISOString();
  const device = await deviceId();
  const order: PedidoResponse = { id: request.pedido.id, numero: 0, provisional: request.pedido.id.slice(0, 8).toUpperCase(),
    referencia: request.pedido.referencia, nombreCliente: request.pedido.nombreCliente ?? null,
    cliente: request.pedido.nombreCliente || request.pedido.referencia, atendidoPor: `${session.usuario.nombre} ${session.usuario.apellido}`,
    creadoPor: userId, estadoPreparacion: "PENDIENTE", estadoPago: request.cobrar ? "PAGADO" : "PENDIENTE",
    detalles: lines.map((line) => ({ productoId: line.producto.id, producto: line.producto.nombre,
      cantidad: line.cantidad, precioUnitario: line.producto.precio, subtotal: Math.round(line.producto.precio * 100) * line.cantidad / 100 })),
    total: lines.reduce((sum, line) => sum + Math.round(line.producto.precio * 100) * line.cantidad, 0) / 100,
    creadoEn: occurred, canceladoEn: null, motivoCancelacion: null };
  const operation: OfflineOperation = { id: request.pedido.id, dispositivoId: device, pedidoId: order.id, ocurridoEn: occurred,
    crear: { catalogoId, referencia: order.referencia, nombreCliente: request.pedido.nombreCliente,
      detalles: order.detalles.map((line) => ({ productoId: line.productoId, cantidad: line.cantidad, precioUnitario: line.precioUnitario })) },
    pagoId: request.cobrar ? request.pagoId : null, listo: false, totalEsperado: order.total };
  const stored = await writeOffline(async (db) => {
    sessionFor(userId);
    await requireAuthorized(scope, db);
    const existing = await db.getFirstAsync<{ value: string }>("SELECT value FROM offline_orders WHERE scope = ? AND id = ?", scope, order.id);
    if (existing) return JSON.parse(existing.value) as StoredOrder;
    const value: StoredOrder = { pedido: order, creadoPor: userId, pagadoEn: request.cobrar ? occurred : null, pagadoPor: request.cobrar ? userId : null, estado: "pendiente" };
    await putOrder(db, scope, value);
    await db.runAsync("INSERT INTO offline_outbox (scope, id, pedidoId, contenido, estado) VALUES (?, ?, ?, ?, 'pendiente')", scope, operation.id, order.id, JSON.stringify(operation));
    if (!useOfflineStore.getState().connected) await rememberOfflineOperations(db, scope, [operation.id]);
    return value;
  });
  await refreshOfflineState(userId);
  void synchronizeOffline().catch(() => undefined);
  return decorate(stored);
};

export const operarPedidoLocal = async (id: string, action: "cobrar" | "finalizar", paymentId?: string): Promise<PedidoResponse> => {
  const { scope, userId } = localContext();
  await requireAuthorized(scope);
  const device = await deviceId();
  const result = await writeOffline(async (db) => {
    sessionFor(userId);
    await requireAuthorized(scope, db);
    const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM offline_orders WHERE scope = ? AND id = ?", scope, id);
    if (!row) throw offlineError("Descarga el detalle de este pedido antes de operar sin conexión.");
    const order = JSON.parse(row.value) as StoredOrder;
    if (order.creadoPor !== userId) throw offlineError("Offline solo puedes operar tus propios pedidos.");
    if (order.estado === "conflicto" || order.pedido.canceladoEn) throw offlineError("Este pedido requiere revisión antes de registrar otra operación.");
    if ((action === "cobrar" && order.pedido.estadoPago === "PAGADO") || (action === "finalizar" && order.pedido.estadoPreparacion === "LISTO")) return order;
    const rows = await db.getAllAsync<{ id: string; contenido: string; intentado: number }>("SELECT id, contenido, intentado FROM offline_outbox WHERE scope = ? AND pedidoId = ? AND estado = 'pendiente' ORDER BY rowid", scope, id);
    const create = action === "finalizar" ? rows.find((item) => !item.intentado && (JSON.parse(item.contenido) as OfflineOperation).crear) : undefined;
    const occurred = new Date().toISOString();
    const operation: OfflineOperation = create ? JSON.parse(create.contenido) as OfflineOperation : {
      id: randomUUID(), dispositivoId: device, pedidoId: id, ocurridoEn: occurred, crear: null, pagoId: null, listo: false,
      totalEsperado: order.pedido.total, version: order.pedido.version,
    };
    if (action === "cobrar") { operation.pagoId = paymentId ?? randomUUID(); order.pedido.estadoPago = "PAGADO"; order.pagadoEn = occurred; order.pagadoPor = userId; }
    else { operation.listo = true; operation.listoEn = occurred; order.pedido.estadoPreparacion = "LISTO"; }
    if (create) await db.runAsync("UPDATE offline_outbox SET contenido = ? WHERE scope = ? AND id = ?", JSON.stringify(operation), scope, create.id);
    else await db.runAsync("INSERT INTO offline_outbox (scope, id, pedidoId, contenido, estado) VALUES (?, ?, ?, ?, 'pendiente')", scope, operation.id, id, JSON.stringify(operation));
    if (!useOfflineStore.getState().connected) await rememberOfflineOperations(db, scope, [operation.id]);
    order.estado = "pendiente";
    await putOrder(db, scope, order);
    return order;
  });
  await refreshOfflineState(userId);
  void synchronizeOffline().catch(() => undefined);
  return decorate(result);
};

export const synchronizeOffline = (): Promise<void> => {
  if (!supportsOffline) return Promise.resolve();
  const userId = useSessionStore.getState().session?.usuario.id ?? null;
  if (running) return runningUser === userId ? running : running.catch(() => undefined).then(synchronizeOffline);
  runningUser = userId;
  running = sync().finally(() => { running = null; runningUser = null; });
  return running;
};

export const refreshOfflineData = async (): Promise<void> => {
  const user = useSessionStore.getState().session?.usuario;
  if (!supportsOffline || !user || !["ADMINISTRADOR", "CAJERO"].includes(user.rol)) return;
  await synchronizeOffline().catch(() => undefined);
};

const sync = async (): Promise<void> => {
  const { scope, userId } = localContext();
  if (!useOfflineStore.getState().connected || await readMeta<boolean>(scope, "released")) return;
  useOfflineStore.setState({ syncing: true, error: null });
  try {
    const existing = await readOutbox(scope);
    if (existing.some((row) => row.estado === "conflicto")) {
      const reviewed = await OfflineInstance.estados(userId);
      if (!reviewed.data) throw ApiError.invalidResponse();
      await writeOffline(async (db) => {
        for (const result of reviewed.data!) {
          if (result.estado === "revisado") await db.runAsync("UPDATE offline_outbox SET estado = 'revisado', mensaje = ? WHERE scope = ? AND id = ?", result.mensaje, scope, result.id);
        }
      });
    }
    const rows = await readOutbox(scope);
    const blocked = new Set(rows.filter((row) => row.estado === "conflicto").map((row) => row.pedidoId));
    for (const row of rows) {
      sessionFor(userId);
      if (row.estado !== "pendiente" || blocked.has(row.pedidoId)) continue;
      const operation = await writeOffline(async (db) => {
        const fresh = await db.getFirstAsync<{ contenido: string }>("SELECT contenido FROM offline_outbox WHERE scope = ? AND id = ?", scope, row.id);
        const operation = JSON.parse(fresh!.contenido) as OfflineOperation;
        if (!row.intentado && !operation.crear && !operation.version) {
          const order = await db.getFirstAsync<{ value: string }>("SELECT value FROM offline_orders WHERE scope = ? AND id = ?", scope, row.pedidoId);
          if (order) operation.version = (JSON.parse(order.value) as StoredOrder).pedido.version;
        }
        await db.runAsync("UPDATE offline_outbox SET intentado = 1, contenido = ? WHERE scope = ? AND id = ?", JSON.stringify(operation), scope, row.id);
        return operation;
      });
      sessionFor(userId);
      const response = await OfflineInstance.enviar(operation, userId);
      if (!response.data || response.data.id !== row.id) throw ApiError.invalidResponse();
      const result: OfflineResult = response.data;
      await writeOffline(async (db) => {
        await db.runAsync("UPDATE offline_outbox SET estado = ?, mensaje = ? WHERE scope = ? AND id = ?", result.estado, result.mensaje, scope, row.id);
        const pending = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM offline_outbox WHERE scope = ? AND pedidoId = ? AND estado IN ('pendiente', 'conflicto')", scope, row.pedidoId);
        const stored = await db.getFirstAsync<{ value: string }>("SELECT value FROM offline_orders WHERE scope = ? AND id = ?", scope, row.pedidoId);
        if (stored) {
          const order = JSON.parse(stored.value) as StoredOrder;
          if (result.pedido) {
            if (!pending?.count) order.pedido = result.pedido;
            else { order.pedido.numero = result.pedido.numero; order.pedido.version = result.pedido.version; order.pedido.provisional = undefined; }
          }
          order.estado = result.estado === "conflicto" ? "conflicto" : pending?.count ? "pendiente" : "sincronizado";
          order.mensaje = result.mensaje;
          await putOrder(db, scope, order);
        }
      });
      if (result.estado === "conflicto") blocked.add(row.pedidoId);
    }
    sessionFor(userId);
    const snapshot = await OfflineInstance.descargar(await deviceId(), userId);
    if (!snapshot.data) throw ApiError.invalidResponse();
    await saveSnapshot(scope, snapshot.data);
    await publishOfflineNotice(scope, userId);
  } catch (error) {
    const failure = ApiError.from(error);
    if (useSessionStore.getState().session?.usuario.id === userId) {
      useOfflineStore.setState({ error: failure.mensaje });
      await restorePendingOfflineNotice().catch(() => undefined);
      if (failure.sesionInvalida) await validarSesion();
    }
    throw error;
  } finally {
    if (useSessionStore.getState().session?.usuario.id === userId) {
      await refreshOfflineState(userId).catch(() => undefined);
      if (useSessionStore.getState().session?.usuario.id === userId) useOfflineStore.setState({ syncing: false });
    }
  }
};

export const liberarDispositivo = async (): Promise<void> => {
  const { scope, userId } = localContext();
  await synchronizeOffline();
  await writeOffline(async (db) => {
    sessionFor(userId);
    const pending = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM offline_outbox WHERE scope = ? AND estado IN ('pendiente', 'conflicto')", scope);
    if (pending?.count) throw offlineError("Sincroniza y resuelve todas las operaciones antes de liberar este dispositivo.");
    await putMeta(db, scope, "released", true);
    await putMeta(db, scope, "authorized", false);
    await putMeta(db, scope, "releasePending", true);
  });
  await refreshOfflineState(userId);
  if (running) await running;
  sessionFor(userId);
  await OfflineInstance.liberar(await deviceId(), userId);
  await writeOffline(async (db) => { await putMeta(db, scope, "authorized", false); await putMeta(db, scope, "released", true); await putMeta(db, scope, "releasePending", false); });
  await refreshOfflineState(userId);
};

export const autorizarDispositivo = async (): Promise<void> => {
  const { scope, userId } = localContext();
  if (await readMeta<boolean>(scope, "releasePending")) throw offlineError("Confirma la liberación pendiente antes de autorizar este dispositivo otra vez.");
  const response = await OfflineInstance.descargar(await deviceId(), userId, true);
  if (!response.data) throw ApiError.invalidResponse();
  sessionFor(userId);
  await saveSnapshot(scope, response.data);
  await writeOffline(async (db) => { await putMeta(db, scope, "released", false); });
  await synchronizeOffline();
  await refreshOfflineState(userId);
};
