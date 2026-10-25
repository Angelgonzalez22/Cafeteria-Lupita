using System.ComponentModel.DataAnnotations;

namespace Lupita.Api.DTOs.Productos;

public sealed class EstadoProductoRequest
{
    [Required] public bool? Activo { get; init; }
}
