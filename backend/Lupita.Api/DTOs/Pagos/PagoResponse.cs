namespace Lupita.Api.DTOs.Pagos;

public sealed record PagoResponse(Guid Id, Guid PedidoId, long NumeroPedido, decimal Monto, string MetodoPago,
    DateTimeOffset CreadoEn, Guid CreadoPor, string CobradoPor, bool Anulado,
    DateTimeOffset? AnuladoEn, Guid? AnuladoPor, string? MotivoAnulacion);
public sealed record PagoCreadoResult(PagoResponse Pago, bool Creado);
