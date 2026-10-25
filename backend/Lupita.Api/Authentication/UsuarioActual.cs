using Lupita.Api.Common.Exceptions;

namespace Lupita.Api.Authentication;

public sealed class UsuarioActual(IHttpContextAccessor accessor) : IUsuarioActual
{
    public Guid Id => Guid.TryParse(accessor.HttpContext?.User.FindFirst("sub")?.Value, out var id)
        ? id : throw new UnauthorizedException("Se requiere una sesión válida.");
    public bool EsAdministrador => accessor.HttpContext?.User.IsInRole(RolesSistema.Administrador) == true;
}
