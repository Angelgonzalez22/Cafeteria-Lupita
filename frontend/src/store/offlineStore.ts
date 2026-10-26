/* ESTADO VISIBLE DE LA CONEXIÓN Y COLA OFFLINE */

import { create } from "zustand";
import type { OfflineSyncNotice } from "../models/common/offline";

interface OfflineState {
  userId: string | null;
  connected: boolean;
  initialized: boolean;
  syncing: boolean;
  authorized: boolean;
  released: boolean;
  releasePending: boolean;
  updatedAt: string | null;
  pending: number;
  conflicts: number;
  error: string | null;
  revision: number;
  syncNotice: OfflineSyncNotice | null;
}

export const useOfflineStore = create<OfflineState>(() => ({
  userId: null,
  connected: true,
  initialized: false,
  syncing: false,
  authorized: false,
  released: false,
  releasePending: false,
  updatedAt: null,
  pending: 0,
  conflicts: 0,
  error: null,
  revision: 0,
  syncNotice: null,
}));
