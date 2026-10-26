using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Lupita.Api.DTOs.Pagos;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class CrearPagoRequest : IValidatableObject
{
    public Guid Id { get; init; }
    public Guid PedidoId { get; init; }
    public bool ConfirmarPedidoAjeno { get; init; }
    public decimal? TotalEsperado { get; init; }
    public string? VersionPedido { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Id == Guid.Empty) yield return new("El UUID del pago es obligatorio.", [nameof(Id)]);
        if (PedidoId == Guid.Empty) yield return new("El UUID del pedido es obligatorio.", [nameof(PedidoId)]);
    }
}

public sealed class AnularPagoRequest
{
    [Required, StringLength(255)] public string Motivo { get; init; } = "";
}
