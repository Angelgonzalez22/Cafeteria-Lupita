/* LA VERSIÓN WEB CONSERVA EL FLUJO ONLINE SIN CARGAR SQLITE */

import type { SQLiteDatabase } from "expo-sqlite";
import type { OfflineSnapshot, OutboxRow, StoredOrder } from "../models/common/offline";

export const offlineScope = (userId: string): string => `${process.env.EXPO_PUBLIC_API_URL}|${userId}`;

export const getOfflineDatabase = async (): Promise<SQLiteDatabase> => {
  throw new Error("El almacenamiento offline está disponible en la aplicación móvil.");
};

export const writeOffline = async <T>(_action: (db: SQLiteDatabase) => Promise<T>): Promise<T> => {
  throw new Error("El almacenamiento offline está disponible en la aplicación móvil.");
};

export const readMeta = async <T>(_scope: string, _key: string): Promise<T | null> => null;
export const readMetaFrom = async <T>(_db: SQLiteDatabase, _scope: string, _key: string): Promise<T | null> => null;
export const readOrders = async (_scope: string): Promise<StoredOrder[]> => [];
export const readOutbox = async (_scope: string): Promise<OutboxRow[]> => [];

export const putMeta = async (_db: SQLiteDatabase, _scope: string, _key: string, _value: unknown): Promise<void> => {
  throw new Error("El almacenamiento offline está disponible en la aplicación móvil.");
};

export const putOrder = async (_db: SQLiteDatabase, _scope: string, _order: StoredOrder): Promise<void> => {
  throw new Error("El almacenamiento offline está disponible en la aplicación móvil.");
};

export const saveSnapshot = async (_scope: string, _snapshot: OfflineSnapshot): Promise<void> => {
  throw new Error("El almacenamiento offline está disponible en la aplicación móvil.");
};
