using System.ComponentModel.DataAnnotations;
using Lupita.Api.Common.Pagination;

namespace Lupita.Api.DTOs.Pedidos;

public sealed class PedidoQuery : PaginationQuery, IValidatableObject
{
    public DateTimeOffset? FechaInicial { get; init; }
    public DateTimeOffset? FechaFinal { get; init; }
    [StringLength(30)] public string? Referencia { get; init; }
    [StringLength(100)] public string? Cliente { get; init; }
    [RegularExpression("^(PENDIENTE|PREPARANDO|LISTO)$")] public string? EstadoPreparacion { get; init; }
    [RegularExpression("^(PENDIENTE|PAGADO)$")] public string? EstadoPago { get; init; }
    public bool? Cancelados { get; init; }
    public bool? Eliminados { get; init; }
    public Guid? EmpleadoId { get; init; }
    public bool SoloMios { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (FechaInicial > FechaFinal) yield return new("La fecha inicial debe ser anterior a la final.");
        if (EmpleadoId == Guid.Empty) yield return new("El UUID del empleado no es válido.");
    }
}
