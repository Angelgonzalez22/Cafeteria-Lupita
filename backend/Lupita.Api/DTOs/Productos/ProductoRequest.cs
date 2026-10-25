using System.ComponentModel.DataAnnotations;

namespace Lupita.Api.DTOs.Productos;

public sealed class ProductoRequest : IValidatableObject
{
    [Required, StringLength(120)] public string Nombre { get; init; } = "";
    [StringLength(255)] public string? Descripcion { get; init; }
    [StringLength(500)] public string? ImagenUrl { get; init; }
    [Range(typeof(decimal), "0", "9999999999.99")] public decimal Precio { get; init; }
    [Range(typeof(decimal), "0", "9999999999.99")] public decimal Costo { get; init; }
    public bool Activo { get; init; } = true;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(Nombre))
            yield return new("El nombre es obligatorio.", [nameof(Nombre)]);
        if (Precio != decimal.Round(Precio, 2) || Costo != decimal.Round(Costo, 2))
            yield return new("Los importes admiten hasta dos decimales.", [nameof(Precio), nameof(Costo)]);
        if (ImagenUrl is not null && (!Uri.TryCreate(ImagenUrl, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)))
            yield return new("La imagen requiere una URL HTTP o HTTPS válida.", [nameof(ImagenUrl)]);
    }
}
