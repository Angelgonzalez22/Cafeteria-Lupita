namespace Lupita.Api.Models;

public sealed class DetallePedido
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PedidoId { get; set; }
    public Pedido Pedido { get; set; } = null!;
    public Guid ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal CostoUnitario { get; set; }
    public decimal Subtotal { get; set; }
    public short Eliminado { get; set; }
    public DateTime? EliminadoEn { get; set; }
    public Guid? EliminadoPor { get; set; }
}
