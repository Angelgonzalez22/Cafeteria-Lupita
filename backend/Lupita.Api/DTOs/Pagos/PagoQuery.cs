using System.ComponentModel.DataAnnotations;
using Lupita.Api.Common.Pagination;

namespace Lupita.Api.DTOs.Pagos;

public sealed class PagoQuery : PaginationQuery, IValidatableObject
{
    public DateTimeOffset? Desde { get; init; }
    public DateTimeOffset? Hasta { get; init; }
    public bool? Anulados { get; init; }
    public Guid? PedidoId { get; init; }
    public Guid? EmpleadoId { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Desde > Hasta) yield return new("Desde debe ser anterior o igual a hasta.");
        if (PedidoId == Guid.Empty || EmpleadoId == Guid.Empty) yield return new("El UUID del filtro no es válido.");
    }
}
