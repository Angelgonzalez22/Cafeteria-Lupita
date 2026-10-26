/* BASE LOCAL CON ESCRITURAS SERIALIZADAS Y COLA DURABLE */

import { openDatabaseAsync } from "expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";
import type { OfflineSnapshot, OutboxRow, StoredOrder } from "../models/common/offline";

let database: Promise<SQLiteDatabase> | null = null;
let writes: Promise<unknown> = Promise.resolve();

export const offlineScope = (userId: string): string => `${process.env.EXPO_PUBLIC_API_URL}|${userId}`;

export const getOfflineDatabase = (): Promise<SQLiteDatabase> => {
  if (!database) {
    database = (async () => {
      const db = await openDatabaseAsync("lupita-offline-v1.db");
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS offline_meta (scope TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY (scope, key));
        CREATE TABLE IF NOT EXISTS offline_orders (scope TEXT NOT NULL, id TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY (scope, id));
        CREATE TABLE IF NOT EXISTS offline_outbox (scope TEXT NOT NULL, id TEXT NOT NULL, pedidoId TEXT NOT NULL, contenido TEXT NOT NULL,
          estado TEXT NOT NULL, intentado INTEGER NOT NULL DEFAULT 0, mensaje TEXT NOT NULL DEFAULT '', PRIMARY KEY (scope, id));
      `);
      return db;
    })().catch((error: unknown) => { database = null; throw error; });
  }
  return database;
};

export const writeOffline = <T>(action: (db: SQLiteDatabase) => Promise<T>): Promise<T> => {
  const next = writes.then(async () => {
    const db = await getOfflineDatabase();
    let result: T;
    await db.withExclusiveTransactionAsync(async (tx) => { result = await action(tx); });
    return result!;
  });
  writes = next.catch(() => undefined);
  return next;
};

export const readMeta = async <T>(scope: string, key: string): Promise<T | null> => {
  const db = await getOfflineDatabase();
  return readMetaFrom<T>(db, scope, key);
};

export const readMetaFrom = async <T>(db: SQLiteDatabase, scope: string, key: string): Promise<T | null> => {
  const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM offline_meta WHERE scope = ? AND key = ?", scope, key);
  return row ? JSON.parse(row.value) as T : null;
};

export const putMeta = async (db: SQLiteDatabase, scope: string, key: string, value: unknown): Promise<void> => {
  await db.runAsync("INSERT OR REPLACE INTO offline_meta (scope, key, value) VALUES (?, ?, ?)", scope, key, JSON.stringify(value));
};

export const readOrders = async (scope: string): Promise<StoredOrder[]> => {
  const db = await getOfflineDatabase();
  const rows = await db.getAllAsync<{ value: string }>("SELECT value FROM offline_orders WHERE scope = ?", scope);
  return rows.map((row) => JSON.parse(row.value) as StoredOrder);
};

export const putOrder = async (db: SQLiteDatabase, scope: string, order: StoredOrder): Promise<void> => {
  await db.runAsync("INSERT OR REPLACE INTO offline_orders (scope, id, value) VALUES (?, ?, ?)", scope, order.pedido.id, JSON.stringify(order));
};

export const readOutbox = async (scope: string): Promise<OutboxRow[]> => {
  const db = await getOfflineDatabase();
  return db.getAllAsync<OutboxRow>("SELECT id, pedidoId, contenido, estado, intentado, mensaje FROM offline_outbox WHERE scope = ? ORDER BY rowid", scope);
};

export const saveSnapshot = async (scope: string, snapshot: OfflineSnapshot): Promise<void> => {
  await writeOffline(async (db) => {
    const dirty = await db.getAllAsync<{ pedidoId: string }>("SELECT DISTINCT pedidoId FROM offline_outbox WHERE scope = ? AND estado IN ('pendiente', 'conflicto')", scope);
    const protectedIds = new Set(dirty.map((row) => row.pedidoId));
    const current = await db.getAllAsync<{ id: string }>("SELECT id FROM offline_orders WHERE scope = ?", scope);
    const incoming = new Set(snapshot.pedidos.map((row) => row.pedido.id));
    for (const row of current) {
      if (!protectedIds.has(row.id) && !incoming.has(row.id)) await db.runAsync("DELETE FROM offline_orders WHERE scope = ? AND id = ?", scope, row.id);
    }
    for (const order of snapshot.pedidos) {
      if (!protectedIds.has(order.pedido.id)) await putOrder(db, scope, { ...order, estado: "sincronizado" });
    }
    await putMeta(db, scope, "snapshot", { ...snapshot, pedidos: [] });
    await putMeta(db, scope, `catalog:${snapshot.catalogoId}`, snapshot.productos);
    await putMeta(db, scope, "authorized", true);
  });
};
