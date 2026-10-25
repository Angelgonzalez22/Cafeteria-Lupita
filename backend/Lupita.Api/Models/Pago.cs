namespace Lupita.Api.Models;

public sealed class Pago
{
    public Guid Id { get; set; }
    public Guid PedidoId { get; set; }
    public Pedido Pedido { get; set; } = null!;
    public decimal Monto { get; set; }
    public string MetodoPago { get; set; } = "EFECTIVO";
    public DateTime CreadoEn { get; set; }
    public Guid CreadoPor { get; set; }
    public Usuario Creador { get; set; } = null!;
    public bool Anulado { get; set; }
    public DateTime? AnuladoEn { get; set; }
    public Guid? AnuladoPor { get; set; }
    public Usuario? Anulador { get; set; }
    public string? MotivoAnulacion { get; set; }
}
