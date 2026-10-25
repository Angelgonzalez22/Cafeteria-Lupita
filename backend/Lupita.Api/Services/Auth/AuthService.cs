using Lupita.Api.Authentication;
using Lupita.Api.Common.Exceptions;
using Lupita.Api.Common.Time;
using Lupita.Api.Data;
using Lupita.Api.DTOs.Auth;
using Lupita.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
namespace Lupita.Api.Services.Auth;
public sealed class AuthService(CafeteriaDbContext db, IPasswordHasher<Usuario> hasher, JwtTokenService tokens, IAppClock clock) : IAuthService
{
    //SERVICIO PARA INICIAR SESION CON CEDULA Y CONTRASENA
    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var cedula = request.Cedula.Trim();
        var user = await db.Usuarios.Include(x => x.Rol).SingleOrDefaultAsync(x => x.Cedula == cedula, cancellationToken);
        if (user is null || !user.Activo || user.Eliminado != 0)
            throw new UnauthorizedException("Credenciales inválidas.");
        PasswordVerificationResult result;
        try { result = hasher.VerifyHashedPassword(user, user.ContrasenaHash, request.Contrasena); }
        catch (FormatException) { throw new UnauthorizedException("Credenciales inválidas."); }
        if (result == PasswordVerificationResult.Failed) throw new UnauthorizedException("Credenciales inválidas.");
        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.ContrasenaHash = hasher.HashPassword(user, request.Contrasena);
            user.ActualizadoEn = clock.UtcNow;
            user.ActualizadoPor = user.Id;
            await db.SaveChangesAsync(cancellationToken);
        }
        return tokens.Create(user);
    }
    //SERVICIO PARA TRAER EL USUARIO AUTENTICADO
    public async Task<UsuarioResponse> MeAsync(Guid id, CancellationToken cancellationToken)
    {
        var user = await db.Usuarios.AsNoTracking().Include(x => x.Rol).SingleOrDefaultAsync(x => x.Id == id && x.Activo && x.Eliminado == 0, cancellationToken)
            ?? throw new UnauthorizedException("La sesión ya no está disponible.");
        return new(user.Id, user.Nombre, user.Apellido, user.Rol.Nombre);
    }
}
