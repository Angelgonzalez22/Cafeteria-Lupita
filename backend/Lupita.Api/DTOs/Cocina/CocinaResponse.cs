namespace Lupita.Api.DTOs.Cocina;

public sealed record CocinaListadoResponse(Guid Id, long Numero, string Cliente, string EstadoPreparacion,
    DateTimeOffset CreadoEn, bool Cancelado, bool Eliminado);
public sealed record CocinaProductoResponse(Guid ProductoId, string Producto, int Cantidad);
public sealed record CocinaPedidoResponse(Guid Id, long Numero, string Cliente, string AtendidoPor,
    string EstadoPreparacion, DateTimeOffset CreadoEn, bool Cancelado, bool Eliminado,
    IReadOnlyList<CocinaProductoResponse> Detalles);
