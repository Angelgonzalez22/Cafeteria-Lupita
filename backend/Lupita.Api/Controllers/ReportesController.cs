using Lupita.Api.Authentication;
using Lupita.Api.Common.Responses;
using Lupita.Api.DTOs.Reportes;
using Lupita.Api.Services.Reportes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lupita.Api.Controllers;

[ApiController, Route("api/reportes"), Produces("application/json")]
[ProducesResponseType<ApiResponse<object>>(400)]
[ProducesResponseType<ApiResponse<object>>(401)]
[ProducesResponseType<ApiResponse<object>>(403)]
public sealed class ReportesController(IReporteService reportes) : ControllerBase
{
    [HttpGet("ventas"), Authorize(Policy = PoliticasAcceso.VerReportes)]
    [ProducesResponseType<ApiResponse<VentasReporteResponse>>(200)]
    public async Task<ActionResult<ApiResponse<VentasReporteResponse>>> Ventas([FromQuery] ReporteQuery query, CancellationToken cancellationToken)
        => Ok(ApiResponse<VentasReporteResponse>.Success(await reportes.VentasAsync(query, cancellationToken),
            "Consulta exitosa", "Reporte de ventas obtenido correctamente."));

    [HttpGet("utilidad"), Authorize(Policy = PoliticasAcceso.VerReportes)]
    [ProducesResponseType<ApiResponse<UtilidadReporteResponse>>(200)]
    public async Task<ActionResult<ApiResponse<UtilidadReporteResponse>>> Utilidad([FromQuery] ReporteQuery query, CancellationToken cancellationToken)
        => Ok(ApiResponse<UtilidadReporteResponse>.Success(await reportes.UtilidadAsync(query, cancellationToken),
            "Consulta exitosa", "Costos de productos y utilidad bruta estimada obtenidos correctamente."));

    [HttpGet("productos-mas-vendidos"), Authorize(Policy = PoliticasAcceso.VerReportes)]
    [ProducesResponseType<ApiResponse<ProductosVendidosResponse>>(200)]
    public async Task<ActionResult<ApiResponse<ProductosVendidosResponse>>> Productos([FromQuery] ProductosVendidosQuery query, CancellationToken cancellationToken)
        => Ok(ApiResponse<ProductosVendidosResponse>.Success(await reportes.ProductosMasVendidosAsync(query, cancellationToken),
            "Consulta exitosa", "Productos más vendidos obtenidos correctamente."));

    [HttpGet("resumen"), Authorize(Policy = PoliticasAcceso.VerReportes)]
    [ProducesResponseType<ApiResponse<ResumenReporteResponse>>(200)]
    public async Task<ActionResult<ApiResponse<ResumenReporteResponse>>> Resumen([FromQuery] ReporteQuery query, CancellationToken cancellationToken)
        => Ok(ApiResponse<ResumenReporteResponse>.Success(await reportes.ResumenAsync(query, cancellationToken),
            "Consulta exitosa", "Resumen obtenido correctamente."));

    [HttpGet("mis-ventas"), Authorize(Policy = PoliticasAcceso.CobrarPedidos)]
    [ProducesResponseType<ApiResponse<MisVentasResponse>>(200)]
    public async Task<ActionResult<ApiResponse<MisVentasResponse>>> MisVentas([FromQuery] ReporteQuery query, CancellationToken cancellationToken)
        => Ok(ApiResponse<MisVentasResponse>.Success(await reportes.MisVentasAsync(query, cancellationToken),
            "Consulta exitosa", "Operaciones propias obtenidas correctamente."));

    [HttpGet("cocina"), Authorize(Policy = PoliticasAcceso.PrepararPedidos)]
    [ProducesResponseType<ApiResponse<CocinaReporteResponse>>(200)]
    public async Task<ActionResult<ApiResponse<CocinaReporteResponse>>> Cocina([FromQuery] ReporteQuery query, CancellationToken cancellationToken)
        => Ok(ApiResponse<CocinaReporteResponse>.Success(await reportes.CocinaAsync(query, cancellationToken),
            "Consulta exitosa", "Resumen de cocina obtenido correctamente."));
}
