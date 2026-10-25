using Lupita.Api.Common.Responses;
using Lupita.Api.DTOs.Productos;

namespace Lupita.Api.Services.Productos;

public interface IProductoService
{
    Task<PaginatedResponse<ProductoResponse>> ListarAsync(ProductoQuery query, CancellationToken cancellationToken);
    Task<ProductoResponse> ObtenerAsync(Guid id, CancellationToken cancellationToken);
    Task<ProductoResponse> CrearAsync(ProductoRequest request, CancellationToken cancellationToken);
    Task<ProductoResponse> EditarAsync(Guid id, ProductoRequest request, CancellationToken cancellationToken);
    Task<ProductoResponse> CambiarEstadoAsync(Guid id, bool activo, CancellationToken cancellationToken);
    Task EliminarAsync(Guid id, CancellationToken cancellationToken);
}
