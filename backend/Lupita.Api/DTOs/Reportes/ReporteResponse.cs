namespace Lupita.Api.DTOs.Reportes;

public sealed record VentaPuntoResponse(string Fecha, decimal Total);
public sealed record UtilidadPuntoResponse(string Fecha, decimal Ingresos, decimal Costos, decimal Utilidad);
public sealed record VentasReporteResponse(DateOnly Desde, DateOnly Hasta, string Agrupacion,
    decimal TotalVentas, int TotalCobros, int PedidosPagados, IReadOnlyList<VentaPuntoResponse> Serie);
public sealed record UtilidadReporteResponse(DateOnly Desde, DateOnly Hasta, string Agrupacion,
    decimal Ingresos, decimal CostoProductosVendidos, decimal UtilidadBrutaEstimada,
    decimal MargenBrutoPorcentaje, IReadOnlyList<UtilidadPuntoResponse> Serie);
public sealed record ProductoVendidoResponse(Guid ProductoId, string Nombre, long CantidadVendida,
    decimal TotalVentas, decimal CostoEstimado, decimal UtilidadBrutaEstimada);
public sealed record ProductosVendidosResponse(DateOnly Desde, DateOnly Hasta, IReadOnlyList<ProductoVendidoResponse> Productos);
public sealed record ResumenReporteResponse(DateOnly Desde, DateOnly Hasta, decimal TotalCobrado,
    int PedidosCreados, int PedidosPendientesPago, int PedidosPagados, int PedidosCancelados,
    decimal UtilidadBrutaEstimada);
public sealed record MisVentasResponse(DateOnly Desde, DateOnly Hasta, decimal TotalCobrado,
    int TotalCobros, int PedidosCreados, int PedidosPendientesPago);
public sealed record CocinaReporteResponse(DateOnly Desde, DateOnly Hasta,
    int PedidosPendientes, int PedidosPreparando, int PedidosListos);
