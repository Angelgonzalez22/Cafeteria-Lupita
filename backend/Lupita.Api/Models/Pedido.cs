namespace Lupita.Api.Models;

public sealed class Pedido
{
    public Guid Id { get; set; }
    public long Numero { get; set; }
    public string Referencia { get; set; } = "";
    public string? NombreCliente { get; set; }
    public string EstadoPreparacion { get; set; } = EstadosPedido.Pendiente;
    public string EstadoPago { get; set; } = EstadosPedido.Pendiente;
    public decimal Total { get; set; }
    public DateTime CreadoEn { get; set; }
    public Guid CreadoPor { get; set; }
    public Usuario Creador { get; set; } = null!;
    public DateTime? ActualizadoEn { get; set; }
    public Guid? ActualizadoPor { get; set; }
    public DateTime? CanceladoEn { get; set; }
    public Guid? CanceladoPor { get; set; }
    public string? MotivoCancelacion { get; set; }
    public short Eliminado { get; set; }
    public DateTime? EliminadoEn { get; set; }
    public Guid? EliminadoPor { get; set; }
    public List<DetallePedido> Detalles { get; set; } = [];
}
