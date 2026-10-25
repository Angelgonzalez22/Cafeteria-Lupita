using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Lupita.Api.DTOs.Pedidos;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class EditarPedidoRequest : IValidatableObject
{
    [Required, StringLength(30)] public string Referencia { get; init; } = "";
    [StringLength(100)] public string? NombreCliente { get; init; }
    [Required, MinLength(1), MaxLength(100)] public List<DetallePedidoRequest> Detalles { get; init; } = [];

    public virtual IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(Referencia)) yield return new("La referencia es obligatoria.", [nameof(Referencia)]);
        if (Detalles is not null)
        {
            if (Detalles.Any(x => x is null))
                yield return new("Los detalles no pueden ser nulos.", [nameof(Detalles)]);
            else if (Detalles.Select(x => x.ProductoId).Distinct().Count() != Detalles.Count)
                yield return new("Cada producto debe aparecer una sola vez.", [nameof(Detalles)]);
        }
    }
}

public sealed class CrearPedidoRequest : EditarPedidoRequest
{
    public Guid Id { get; init; }
    public override IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        foreach (var error in base.Validate(validationContext)) yield return error;
        if (Id == Guid.Empty) yield return new("El UUID del pedido es obligatorio.", [nameof(Id)]);
    }
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class DetallePedidoRequest : IValidatableObject
{
    public Guid ProductoId { get; init; }
    [Range(1, int.MaxValue)] public int Cantidad { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (ProductoId == Guid.Empty) yield return new("El UUID del producto es obligatorio.", [nameof(ProductoId)]);
    }
}
