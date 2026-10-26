/* RUTAS DE LA APLICACIÓN */

export type RootStackParamList = {
  Login: undefined;
  Administrador: undefined;
  Cajero: undefined;
  Cocina: undefined;
  SinAcceso: undefined;
  NuevaVenta: undefined;
  DetallePedido: { id: string };
  Perfil: undefined;
};

export type MainTabParamList = {
  Inicio: undefined;
  Pedidos: undefined;
  Productos: undefined;
  Reportes: undefined;
  Configuracion: undefined;
};
