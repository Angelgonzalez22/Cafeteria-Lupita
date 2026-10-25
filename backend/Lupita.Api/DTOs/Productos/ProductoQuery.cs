using System.ComponentModel.DataAnnotations;
using Lupita.Api.Common.Pagination;

namespace Lupita.Api.DTOs.Productos;

public sealed class ProductoQuery : PaginationQuery, IValidatableObject
{
    [StringLength(120)] public string? Nombre { get; init; }
    public bool? Activo { get; init; }
    public bool? Eliminados { get; init; }
    public DateTimeOffset? FechaInicial { get; init; }
    public DateTimeOffset? FechaFinal { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (FechaInicial > FechaFinal) yield return new("La fecha inicial debe ser anterior a la final.");
    }
}
