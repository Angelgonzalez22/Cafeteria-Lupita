using System.Text.Json.Serialization;

namespace Lupita.Api.DTOs.Productos;

public sealed record ProductoResponse(
    Guid Id, string Nombre, string? ImagenUrl, decimal Precio,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] decimal? Costo = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? Descripcion = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] bool? Activo = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] bool? Eliminado = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] DateTimeOffset? CreadoEn = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] ResponsableResponse? CreadoPor = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] DateTimeOffset? ActualizadoEn = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] ResponsableResponse? ActualizadoPor = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] DateTimeOffset? EliminadoEn = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] ResponsableResponse? EliminadoPor = null);
