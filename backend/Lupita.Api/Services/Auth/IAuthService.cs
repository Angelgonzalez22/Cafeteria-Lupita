using Lupita.Api.DTOs.Auth;
namespace Lupita.Api.Services.Auth;
public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<UsuarioResponse> MeAsync(Guid id, CancellationToken cancellationToken);
    Task<LoginResponse> RenewAsync(Guid id, CancellationToken cancellationToken);
}
