using Lupita.Api.Common.Responses;
using Lupita.Api.DTOs.Pagos;

namespace Lupita.Api.Services.Pagos;

public interface IPagoService
{
    Task<PagoCreadoResult> CrearAsync(CrearPagoRequest request, CancellationToken cancellationToken);
    Task<PaginatedResponse<PagoResponse>> ListarAsync(PagoQuery query, CancellationToken cancellationToken);
    Task<PagoResponse> ObtenerAsync(Guid id, CancellationToken cancellationToken);
    Task<PagoResponse> AnularAsync(Guid id, AnularPagoRequest request, CancellationToken cancellationToken);
}
