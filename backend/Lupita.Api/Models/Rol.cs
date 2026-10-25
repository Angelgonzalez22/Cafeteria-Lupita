namespace Lupita.Api.Models;
public sealed class Rol
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = "";
    public string? Descripcion { get; set; }
}
