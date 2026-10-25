using Lupita.Api.Common.Exceptions;
using Lupita.Api.Common.Responses;
using Lupita.Api.DTOs.Auth;
using Lupita.Api.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Lupita.Api.Controllers;
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public sealed class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("login"), AllowAnonymous]
    [ProducesResponseType<ApiResponse<LoginResponse>>(200)]
    [ProducesResponseType<ApiResponse<object>>(400)]
    [ProducesResponseType<ApiResponse<object>>(401)]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login(LoginRequest request, CancellationToken cancellationToken)
        => Ok(ApiResponse<LoginResponse>.Success(await auth.LoginAsync(request, cancellationToken), "Operación exitosa", "Sesión iniciada correctamente."));
    [HttpGet("me"), Authorize]
    [ProducesResponseType<ApiResponse<UsuarioResponse>>(200)]
    [ProducesResponseType<ApiResponse<object>>(401)]
    public async Task<ActionResult<ApiResponse<UsuarioResponse>>> Me(CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var id)) throw new UnauthorizedException("La sesión no es válida.");
        return Ok(ApiResponse<UsuarioResponse>.Success(await auth.MeAsync(id, cancellationToken), "Operación exitosa", "Usuario consultado correctamente."));
    }
}
