/* VERSIÓN DEL CONTENIDO QUE CAJA CONFIRMÓ AL OPERAR */
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Lupita.Api.DTOs.Pedidos;

namespace Lupita.Api.Common.Concurrency;

public static class PedidoVersion
{
    public static string Calculate(PedidoResponse pedido)
    {
        var content = JsonSerializer.Serialize(new { pedido.Id, pedido.Referencia, pedido.NombreCliente, pedido.Total,
            Detalles = pedido.Detalles.OrderBy(x => x.ProductoId).Select(x => new { x.ProductoId, x.Cantidad, x.PrecioUnitario, x.Subtotal }) });
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(content)));
    }
}
