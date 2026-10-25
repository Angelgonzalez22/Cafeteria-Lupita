using Lupita.Api.Authentication;
using Lupita.Api.Common.Responses;
using Lupita.Api.DTOs.Pagos;
using Lupita.Api.Services.Pagos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lupita.Api.Controllers;

[ApiController, Route("api/pagos"), Produces("application/json")]
[Authorize(Policy = PoliticasAcceso.CobrarPedidos)]
[ProducesResponseType<ApiResponse<object>>(400)]
[ProducesResponseType<ApiResponse<object>>(401)]
[ProducesResponseType<ApiResponse<object>>(403)]
[ProducesResponseType<ApiResponse<object>>(404)]
[ProducesResponseType<ApiResponse<object>>(409)]
public sealed class PagosController(IPagoService pagos) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<ApiResponse<PagoResponse>>(200)]
    [ProducesResponseType<ApiResponse<PagoResponse>>(201)]
    public async Task<ActionResult<ApiResponse<PagoResponse>>> Crear(CrearPagoRequest request, CancellationToken cancellationToken)
    {
        var result = await pagos.CrearAsync(request, cancellationToken);
        if (!result.Creado) return Ok(ApiResponse<PagoResponse>.Success(result.Pago, "Operación exitosa", "El pago ya estaba registrado."));
        return CreatedAtAction(nameof(Obtener), new { id = result.Pago.Id },
            ApiResponse<PagoResponse>.Success(result.Pago, "Operación exitosa", "Cobro registrado correctamente.", 201));
    }

    [HttpGet, ProducesResponseType<PaginatedResponse<PagoResponse>>(200)]
    public async Task<ActionResult<PaginatedResponse<PagoResponse>>> Listar([FromQuery] PagoQuery query, CancellationToken cancellationToken)
        => Ok(await pagos.ListarAsync(query, cancellationToken));

    [HttpGet("{id:guid}"), ProducesResponseType<ApiResponse<PagoResponse>>(200)]
    public async Task<ActionResult<ApiResponse<PagoResponse>>> Obtener(Guid id, CancellationToken cancellationToken)
        => Ok(ApiResponse<PagoResponse>.Success(await pagos.ObtenerAsync(id, cancellationToken),
            "Consulta exitosa", "Pago obtenido correctamente."));

    [HttpPatch("{id:guid}/anular"), Authorize(Policy = PoliticasAcceso.AnularPagos)]
    [ProducesResponseType<ApiResponse<PagoResponse>>(200)]
    public async Task<ActionResult<ApiResponse<PagoResponse>>> Anular(Guid id, AnularPagoRequest request, CancellationToken cancellationToken)
        => Ok(ApiResponse<PagoResponse>.Success(await pagos.AnularAsync(id, request, cancellationToken),
            "Operación exitosa", "Pago anulado. La devolución física del efectivo requiere confirmación del administrador."));
}
