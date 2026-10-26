using Lupita.Api.Authentication;
using Lupita.Api.Common.Responses;
using Lupita.Api.DTOs.Inicio;
using Lupita.Api.Services.Inicio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lupita.Api.Controllers;

[ApiController]
[Route("api/inicio")]
[Produces("application/json")]
[Authorize(Roles = RolesSistema.Administrador + "," + RolesSistema.Cajero + "," + RolesSistema.Cocina)]
public sealed class InicioController(IInicioService inicio) : ControllerBase
{
    [HttpGet("resumen")]
    [ProducesResponseType<ApiResponse<InicioResumenResponse>>(200)]
    [ProducesResponseType<ApiResponse<object>>(401)]
    [ProducesResponseType<ApiResponse<object>>(403)]
    public async Task<ActionResult<ApiResponse<InicioResumenResponse>>> Resumen(CancellationToken cancellationToken)
    {
        var rol = User.FindFirst("role")?.Value ?? "";
        var resumen = await inicio.ResumenAsync(rol, cancellationToken);

        return Ok(ApiResponse<InicioResumenResponse>.Success(
            resumen, "Consulta exitosa", "Resumen de inicio obtenido correctamente."));
    }
}