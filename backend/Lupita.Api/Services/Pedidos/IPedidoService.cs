using Lupita.Api.Common.Responses;
using Lupita.Api.DTOs.Pedidos;

namespace Lupita.Api.Services.Pedidos;

public interface IPedidoService
{
    Task<PedidoCreadoResult> CrearAsync(CrearPedidoRequest request, CancellationToken cancellationToken);
    Task<PedidoResponse> ObtenerAsync(Guid id, CancellationToken cancellationToken);
    Task<PaginatedResponse<PedidoListadoResponse>> ListarAsync(PedidoQuery query, CancellationToken cancellationToken);
    Task<PedidoResponse> EditarAsync(Guid id, EditarPedidoRequest request, CancellationToken cancellationToken);
    Task<PedidoResponse> CancelarAsync(Guid id, CancelarPedidoRequest request, CancellationToken cancellationToken);
}
