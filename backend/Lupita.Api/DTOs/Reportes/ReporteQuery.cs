using System.ComponentModel.DataAnnotations;

namespace Lupita.Api.DTOs.Reportes;

public class ReporteQuery : IValidatableObject
{
    public DateOnly? Desde { get; init; }
    public DateOnly? Hasta { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Desde > Hasta) yield return new("Desde debe ser anterior o igual a hasta.");
        if (Desde == DateOnly.MaxValue || Hasta == DateOnly.MaxValue)
            yield return new("La fecha máxima no está permitida.");
    }
}

public sealed class ProductosVendidosQuery : ReporteQuery
{
    [Range(1, 100)] public int Top { get; init; } = 10;
}
