/* DATOS DEL PERFIL DE LA SESIÓN ACTUAL */

import { useSessionStore } from "../../store/sessionStore";

const roleLabels: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  CAJERO: "Cajero",
  COCINA: "Cocina",
};

export const useProfile = () => {
  const user = useSessionStore((state) => state.session?.usuario);
  const nombre = user?.nombre.trim() ?? "";
  const apellido = user?.apellido.trim() ?? "";

  return {
    nombre,
    apellido,
    nombreCompleto: [nombre, apellido].filter(Boolean).join(" "),
    iniciales: `${nombre.charAt(0)}${apellido.charAt(0)}`.toLocaleUpperCase("es"),
    rol: user ? roleLabels[user.rol] ?? user.rol : "",
  };
};
