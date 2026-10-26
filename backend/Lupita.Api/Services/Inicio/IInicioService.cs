using Lupita.Api.DTOs.Inicio;

namespace Lupita.Api.Services.Inicio;

public interface IInicioService
{
    Task<InicioResumenResponse> ResumenAsync(string rol, CancellationToken cancellationToken);
}