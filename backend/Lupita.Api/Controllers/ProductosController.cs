using Lupita.Api.Authentication;
using Lupita.Api.Common.Responses;
using Lupita.Api.DTOs.Productos;
using Lupita.Api.Services.Productos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lupita.Api.Controllers;

[ApiController]
[Route("api/productos")]
[Produces("application/json")]
[Authorize(Policy = PoliticasAcceso.GestionarVentas)]
[ProducesResponseType<ApiResponse<object>>(400)]
[ProducesResponseType<ApiResponse<object>>(401)]
[ProducesResponseType<ApiResponse<object>>(403)]
[ProducesResponseType<ApiResponse<object>>(404)]
public sealed class ProductosController(IProductoService productos) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<PaginatedResponse<ProductoResponse>>(200)]
    public async Task<ActionResult<PaginatedResponse<ProductoResponse>>> Listar([FromQuery] ProductoQuery query, CancellationToken cancellationToken)
        => Ok(await productos.ListarAsync(query, cancellationToken));

    [HttpGet("{id:guid}")]
    [ProducesResponseType<ApiResponse<ProductoResponse>>(200)]
    public async Task<ActionResult<ApiResponse<ProductoResponse>>> Obtener(Guid id, CancellationToken cancellationToken)
        => Ok(ApiResponse<ProductoResponse>.Success(await productos.ObtenerAsync(id, cancellationToken),
            "Consulta exitosa", "Producto obtenido correctamente."));

    [HttpPost, Authorize(Policy = PoliticasAcceso.GestionarProductos)]
    [ProducesResponseType<ApiResponse<ProductoResponse>>(201)]
    public async Task<ActionResult<ApiResponse<ProductoResponse>>> Crear(ProductoRequest request, CancellationToken cancellationToken)
    {
        var producto = await productos.CrearAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Obtener), new { id = producto.Id },
            ApiResponse<ProductoResponse>.Success(producto, "Operación exitosa", "Producto creado correctamente.", 201));
    }

    [HttpPut("{id:guid}"), Authorize(Policy = PoliticasAcceso.GestionarProductos)]
    [ProducesResponseType<ApiResponse<ProductoResponse>>(200)]
    public async Task<ActionResult<ApiResponse<ProductoResponse>>> Editar(Guid id, ProductoRequest request, CancellationToken cancellationToken)
        => Ok(ApiResponse<ProductoResponse>.Success(await productos.EditarAsync(id, request, cancellationToken),
            "Operación exitosa", "Producto actualizado correctamente."));

    [HttpPatch("{id:guid}/estado"), Authorize(Policy = PoliticasAcceso.GestionarProductos)]
    [ProducesResponseType<ApiResponse<ProductoResponse>>(200)]
    public async Task<ActionResult<ApiResponse<ProductoResponse>>> CambiarEstado(Guid id, EstadoProductoRequest request, CancellationToken cancellationToken)
        => Ok(ApiResponse<ProductoResponse>.Success(await productos.CambiarEstadoAsync(id, request.Activo!.Value, cancellationToken),
            "Operación exitosa", "Estado actualizado correctamente."));

    [HttpDelete("{id:guid}"), Authorize(Policy = PoliticasAcceso.GestionarProductos)]
    [ProducesResponseType<ApiResponse<object>>(200)]
    public async Task<ActionResult<ApiResponse<object>>> Eliminar(Guid id, CancellationToken cancellationToken)
    {
        await productos.EliminarAsync(id, cancellationToken);
        return Ok(new ApiResponse<object>(200, "Operación exitosa", "Producto eliminado correctamente.", null));
    }

}
