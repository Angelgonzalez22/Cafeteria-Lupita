/* REGISTRO DURABLE DE DISPOSITIVOS, CATÁLOGOS Y OPERACIONES OFFLINE */
namespace Lupita.Api.Models;

public sealed class OfflineRecord
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public Guid DispositivoId { get; set; }
    public string Tipo { get; set; } = "";
    public string Contenido { get; set; } = "";
    public string Resultado { get; set; } = "";
    public string Estado { get; set; } = "";
    public DateTime RegistradoEn { get; set; }
}
