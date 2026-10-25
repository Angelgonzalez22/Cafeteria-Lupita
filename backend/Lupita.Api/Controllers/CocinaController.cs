using Lupita.Api.Authentication;
using Lupita.Api.Common.Responses;
using Lupita.Api.DTOs.Cocina;
using Lupita.Api.Services.Cocina;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lupita.Api.Controllers;

[ApiController, Route("api/cocina/pedidos"), Produces("application/json")]
[Authorize(Policy = PoliticasAcceso.PrepararPedidos)]
[ProducesResponseType<ApiResponse<object>>(400)]
[ProducesResponseType<ApiResponse<object>>(401)]
[ProducesResponseType<ApiResponse<object>>(403)]
[ProducesResponseType<ApiResponse<object>>(404)]
[ProducesResponseType<ApiResponse<object>>(409)]
public sealed class CocinaController(ICocinaService cocina) : ControllerBase
{
    [HttpGet, ProducesResponseType<PaginatedResponse<CocinaListadoResponse>>(200)]
    public async Task<ActionResult<PaginatedResponse<CocinaListadoResponse>>> Listar([FromQuery] CocinaQuery query, CancellationToken cancellationToken)
        => Ok(await cocina.ListarAsync(query, cancellationToken));

    [HttpGet("{id:guid}"), ProducesResponseType<ApiResponse<CocinaPedidoResponse>>(200)]
    public async Task<ActionResult<ApiResponse<CocinaPedidoResponse>>> Obtener(Guid id, CancellationToken cancellationToken)
        => Ok(ApiResponse<CocinaPedidoResponse>.Success(await cocina.ObtenerAsync(id, cancellationToken),
            "Consulta exitosa", "Pedido obtenido correctamente."));

    [HttpPatch("{id:guid}/iniciar"), ProducesResponseType<ApiResponse<CocinaPedidoResponse>>(200)]
    public async Task<ActionResult<ApiResponse<CocinaPedidoResponse>>> Iniciar(Guid id, CancellationToken cancellationToken)
        => Ok(ApiResponse<CocinaPedidoResponse>.Success(await cocina.IniciarAsync(id, cancellationToken),
            "Operación exitosa", "Preparación iniciada correctamente."));

    [HttpPatch("{id:guid}/finalizar"), ProducesResponseType<ApiResponse<CocinaPedidoResponse>>(200)]
    public async Task<ActionResult<ApiResponse<CocinaPedidoResponse>>> Finalizar(Guid id, CancellationToken cancellationToken)
        => Ok(ApiResponse<CocinaPedidoResponse>.Success(await cocina.FinalizarAsync(id, cancellationToken),
            "Operación exitosa", "Preparación finalizada correctamente."));
}
