using System.ComponentModel.DataAnnotations;
using Lupita.Api.Common.Pagination;

namespace Lupita.Api.DTOs.Cocina;

public sealed class CocinaQuery : PaginationQuery, IValidatableObject
{
    public bool SoloActivos { get; init; } = true;
    [RegularExpression("^(PENDIENTE|PREPARANDO|LISTO)$")] public string? EstadoPreparacion { get; init; }
    public DateTimeOffset? Desde { get; init; }
    public DateTimeOffset? Hasta { get; init; }
    public bool? Cancelados { get; init; }
    public bool? Eliminados { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Desde > Hasta) yield return new("Desde debe ser anterior o igual a hasta.");
    }
}
