using Lupita.Api.Authentication;
using Lupita.Api.Common.Responses;
using Lupita.Api.DTOs.Pedidos;
using Lupita.Api.Services.Pedidos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lupita.Api.Controllers;

[ApiController]
[Route("api/pedidos")]
[Produces("application/json")]
[Authorize(Policy = PoliticasAcceso.GestionarVentas)]
[ProducesResponseType<ApiResponse<object>>(400)]
[ProducesResponseType<ApiResponse<object>>(401)]
[ProducesResponseType<ApiResponse<object>>(403)]
[ProducesResponseType<ApiResponse<object>>(404)]
[ProducesResponseType<ApiResponse<object>>(409)]
public sealed class PedidosController(IPedidoService pedidos) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<ApiResponse<PedidoResponse>>(201)]
    [ProducesResponseType<ApiResponse<PedidoResponse>>(200)]
    public async Task<ActionResult<ApiResponse<PedidoResponse>>> Crear(CrearPedidoRequest request, CancellationToken cancellationToken)
    {
        var result = await pedidos.CrearAsync(request, cancellationToken);
        if (!result.Creado)
            return Ok(ApiResponse<PedidoResponse>.Success(result.Pedido, "Operación exitosa", "El pedido ya estaba registrado."));
        return CreatedAtAction(nameof(Obtener), new { id = result.Pedido.Id },
            ApiResponse<PedidoResponse>.Success(result.Pedido, "Operación exitosa", "Pedido creado correctamente.", 201));
    }

    [HttpGet]
    [ProducesResponseType<PaginatedResponse<PedidoListadoResponse>>(200)]
    public async Task<ActionResult<PaginatedResponse<PedidoListadoResponse>>> Listar([FromQuery] PedidoQuery query, CancellationToken cancellationToken)
        => Ok(await pedidos.ListarAsync(query, cancellationToken));

    [HttpGet("{id:guid}")]
    [ProducesResponseType<ApiResponse<PedidoResponse>>(200)]
    public async Task<ActionResult<ApiResponse<PedidoResponse>>> Obtener(Guid id, CancellationToken cancellationToken)
        => Ok(ApiResponse<PedidoResponse>.Success(await pedidos.ObtenerAsync(id, cancellationToken),
            "Consulta exitosa", "Pedido obtenido correctamente."));

    [HttpPut("{id:guid}")]
    [ProducesResponseType<ApiResponse<PedidoResponse>>(200)]
    public async Task<ActionResult<ApiResponse<PedidoResponse>>> Editar(Guid id, EditarPedidoRequest request, CancellationToken cancellationToken)
        => Ok(ApiResponse<PedidoResponse>.Success(await pedidos.EditarAsync(id, request, cancellationToken),
            "Operación exitosa", "Pedido actualizado correctamente."));

    [HttpPatch("{id:guid}/cancelar")]
    [ProducesResponseType<ApiResponse<PedidoResponse>>(200)]
    public async Task<ActionResult<ApiResponse<PedidoResponse>>> Cancelar(Guid id, CancelarPedidoRequest request, CancellationToken cancellationToken)
        => Ok(ApiResponse<PedidoResponse>.Success(await pedidos.CancelarAsync(id, request, cancellationToken),
            "Operación exitosa", "Pedido cancelado correctamente."));

}
