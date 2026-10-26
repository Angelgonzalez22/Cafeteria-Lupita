/* CONTRATOS DE DESCARGA Y SINCRONIZACIÓN */
using System.ComponentModel.DataAnnotations;

namespace Lupita.Api.DTOs.Pedidos;

public sealed record OfflineProduct(Guid Id, string Nombre, string? ImagenUrl, decimal Precio);
public sealed record OfflinePrice(Guid Id, decimal Precio, decimal Costo);
public sealed record OfflineOrder(PedidoResponse Pedido, Guid CreadoPor, DateTimeOffset? PagadoEn, Guid? PagadoPor);
public sealed record OfflineSnapshot(Guid CatalogoId, DateTimeOffset ActualizadoEn, IReadOnlyList<OfflineProduct> Productos, IReadOnlyList<OfflineOrder> Pedidos);
public sealed record OfflineLine(Guid ProductoId, int Cantidad, decimal PrecioUnitario);
public sealed record OfflineCreate(Guid CatalogoId, [Required, MaxLength(30)] string Referencia,
    [MaxLength(100)] string? NombreCliente, [Required, MinLength(1), MaxLength(100)] IReadOnlyList<OfflineLine> Detalles);
public sealed record OfflineOperation(Guid Id, Guid DispositivoId, Guid PedidoId, DateTimeOffset OcurridoEn,
    OfflineCreate? Crear, Guid? PagoId, bool Listo, decimal TotalEsperado, string? Version = null, DateTimeOffset? ListoEn = null);
public sealed record OfflineResult(Guid Id, string Estado, string Mensaje, PedidoResponse? Pedido);
public sealed record OfflineResolution([Required, MaxLength(255)] string Motivo);
