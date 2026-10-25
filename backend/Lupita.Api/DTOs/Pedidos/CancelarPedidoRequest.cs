using System.ComponentModel.DataAnnotations;

namespace Lupita.Api.DTOs.Pedidos;

public sealed class CancelarPedidoRequest
{
    [Required, StringLength(255)] public string Motivo { get; init; } = "";
}
