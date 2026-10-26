namespace Lupita.Api.DTOs.Inicio;

public sealed record InicioResumenResponse(
    string Rol,
    DateOnly Fecha,
    DateTimeOffset Desde,
    DateTimeOffset Hasta,
    int PedidosRealizados,
    decimal? TotalCobrado,
    int? PedidosPagados,
    int? PendientesPago,
    int? PendientesPreparacion,
    int? Preparando);