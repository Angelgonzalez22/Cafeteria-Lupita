using Lupita.Api.Common.Exceptions;
using Lupita.Api.Common.Responses;
using Microsoft.AspNetCore.Diagnostics;
namespace Lupita.Api.Common.Middleware;
public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        var error = exception as AppException;
        if (error is null) logger.LogError("Error inesperado {ExceptionType}. TraceId: {TraceId}", exception.GetType().Name, context.TraceIdentifier);
        else logger.LogWarning("Error HTTP {Status}. TraceId: {TraceId}", error.Status, context.TraceIdentifier);
        context.Response.StatusCode = error?.Status ?? 500;
        if (context.Response.StatusCode == 401) context.Response.Headers.WWWAuthenticate = "Bearer";
        await context.Response.WriteAsJsonAsync(new ApiResponse<object>(context.Response.StatusCode, error?.Title ?? "Error interno", error?.Message ?? "Ocurrió un error inesperado.", null), cancellationToken);
        return true;
    }
}
