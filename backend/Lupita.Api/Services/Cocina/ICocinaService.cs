using Lupita.Api.Common.Responses;
using Lupita.Api.DTOs.Cocina;

namespace Lupita.Api.Services.Cocina;

public interface ICocinaService
{
    Task<PaginatedResponse<CocinaListadoResponse>> ListarAsync(CocinaQuery query, CancellationToken cancellationToken);
    Task<CocinaPedidoResponse> ObtenerAsync(Guid id, CancellationToken cancellationToken);
    Task<CocinaPedidoResponse> IniciarAsync(Guid id, CancellationToken cancellationToken);
    Task<CocinaPedidoResponse> FinalizarAsync(Guid id, CancellationToken cancellationToken);
}
