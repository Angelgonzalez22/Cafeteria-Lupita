/* ESTADO DE LA SESIÓN */

import { create } from "zustand";
import type { SessionState } from "../models/auth/auth";

export const useSessionStore = create<SessionState>(() => ({
  session: null,
  ready: false,
  busy: false,
  revision: 0,
  error: null,
}));