namespace Lupita.Api.Models;
public sealed class Usuario
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RolId { get; set; }
    public Rol Rol { get; set; } = null!;
    public string Nombre { get; set; } = "";
    public string Apellido { get; set; } = "";
    public string Cedula { get; set; } = "";
    public string NombreUsuario { get; set; } = "";
    public string ContrasenaHash { get; set; } = "";
    public bool Activo { get; set; } = true;
    public DateTime CreadoEn { get; set; }
    public DateTime? ActualizadoEn { get; set; }
    public Guid? ActualizadoPor { get; set; }
    public short Eliminado { get; set; }
    public DateTime? EliminadoEn { get; set; }
    public Guid? EliminadoPor { get; set; }
}
