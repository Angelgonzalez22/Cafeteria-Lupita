namespace Lupita.Api.Models;

public sealed class Producto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = "";
    public string? Descripcion { get; set; }
    public string? ImagenUrl { get; set; }
    public decimal Precio { get; set; }
    public decimal Costo { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime CreadoEn { get; set; }
    public Guid CreadoPor { get; set; }
    public Usuario Creador { get; set; } = null!;
    public DateTime? ActualizadoEn { get; set; }
    public Guid? ActualizadoPor { get; set; }
    public Usuario? Actualizador { get; set; }
    public short Eliminado { get; set; }
    public DateTime? EliminadoEn { get; set; }
    public Guid? EliminadoPor { get; set; }
    public Usuario? Eliminador { get; set; }
}
