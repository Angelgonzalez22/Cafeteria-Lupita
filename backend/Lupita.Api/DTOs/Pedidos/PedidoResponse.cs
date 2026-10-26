namespace Lupita.Api.DTOs.Pedidos;

public sealed record PedidoListadoResponse(
    Guid Id, long Numero, string Cliente, string AtendidoPor, decimal Total,
    string EstadoPreparacion, string EstadoPago, DateTimeOffset CreadoEn, bool Cancelado, bool Eliminado);

public sealed record DetallePedidoResponse(
    Guid ProductoId, string Producto, int Cantidad, decimal PrecioUnitario, decimal Subtotal);

public sealed record PedidoResponse(
    Guid Id, long Numero, string Referencia, string? NombreCliente, string Cliente, string AtendidoPor,
    string EstadoPreparacion, string EstadoPago, IReadOnlyList<DetallePedidoResponse> Detalles, decimal Total,
    DateTimeOffset CreadoEn, DateTimeOffset? CanceladoEn, string? MotivoCancelacion, Guid CreadoPor = default, string? Version = null);

public sealed record PedidoCreadoResult(PedidoResponse Pedido, bool Creado);
