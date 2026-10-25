using Lupita.Api.DTOs.Reportes;

namespace Lupita.Api.Services.Reportes;

public interface IReporteService
{
    Task<VentasReporteResponse> VentasAsync(ReporteQuery query, CancellationToken cancellationToken);
    Task<UtilidadReporteResponse> UtilidadAsync(ReporteQuery query, CancellationToken cancellationToken);
    Task<ProductosVendidosResponse> ProductosMasVendidosAsync(ProductosVendidosQuery query, CancellationToken cancellationToken);
    Task<ResumenReporteResponse> ResumenAsync(ReporteQuery query, CancellationToken cancellationToken);
    Task<MisVentasResponse> MisVentasAsync(ReporteQuery query, CancellationToken cancellationToken);
    Task<CocinaReporteResponse> CocinaAsync(ReporteQuery query, CancellationToken cancellationToken);
}
