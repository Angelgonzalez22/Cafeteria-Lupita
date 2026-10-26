/* ENDPOINTS DE SINCRONIZACIÓN DE VENTAS */
using Lupita.Api.Authentication;
using Lupita.Api.Common.Responses;
using Lupita.Api.Common.Exceptions;
using Lupita.Api.DTOs.Pedidos;
using Lupita.Api.Services.Pedidos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lupita.Api.Controllers;

[ApiController]
[Route("api/offline")]
[Authorize(Policy = PoliticasAcceso.GestionarVentas)]
public sealed class OfflineController(OfflineService service, IUsuarioActual user) : ControllerBase
{
    private void ValidateUser()
    {
        if (!Guid.TryParse(Request.Headers["X-Offline-Usuario"].ToString(), out var expected) || expected != user.Id)
            throw new ForbiddenException("La sesión cambió. No se enviarán operaciones de otro usuario.");
    }

    [HttpGet("descarga/{device:guid}")]
    public async Task<ApiResponse<OfflineSnapshot>> Download(Guid device, CancellationToken ct, [FromQuery] bool autorizar = false)
    {
        ValidateUser();
        return ApiResponse<OfflineSnapshot>.Success(await service.Download(device, ct, autorizar), "Datos actualizados", "Datos disponibles sin conexión.");
    }

    [HttpPost("operaciones")]
    public async Task<ApiResponse<OfflineResult>> Apply(OfflineOperation request, CancellationToken ct)
    {
        ValidateUser();
        return ApiResponse<OfflineResult>.Success(await service.Apply(request, ct), "Sincronización", "Operación procesada.");
    }

    [HttpPost("dispositivos/{device:guid}/liberar")]
    public async Task<ApiResponse<object>> Release(Guid device, CancellationToken ct)
    {
        ValidateUser();
        await service.Release(device, ct);
        return ApiResponse<object>.Success(null!, "Dispositivo liberado", "Puedes autorizar otro dispositivo.");
    }

    [HttpGet("conflictos")]
    public async Task<ApiResponse<object>> Conflicts(CancellationToken ct)
    {
        ValidateUser();
        return ApiResponse<object>.Success(await service.Conflicts(ct), "Conflictos", "Operaciones que requieren revisión.");
    }

    [HttpGet("operaciones/estados")]
    public async Task<ApiResponse<IReadOnlyList<OfflineResult>>> States(CancellationToken ct)
    {
        ValidateUser();
        return ApiResponse<IReadOnlyList<OfflineResult>>.Success(await service.States(ct), "Estados", "Estado de las operaciones revisadas.");
    }

    [HttpPost("conflictos/{id:guid}/resolver")]
    public async Task<ApiResponse<object>> Resolve(Guid id, OfflineResolution request, CancellationToken ct)
    {
        ValidateUser();
        await service.Resolve(id, request.Motivo, ct);
        return ApiResponse<object>.Success(null!, "Conflicto revisado", "La revisión no registra ni elimina cobros.");
    }
}
