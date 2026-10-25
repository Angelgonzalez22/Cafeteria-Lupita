using Lupita.Api.Authentication;
using Lupita.Api.Common.Time;
using Lupita.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
namespace Lupita.Api.Data.Seed;
public sealed class DevelopmentSeeder(CafeteriaDbContext db, IPasswordHasher<Usuario> hasher, IAppClock clock, IConfiguration config, IHostEnvironment environment)
{
    public async Task SeedAsync(CancellationToken cancellationToken)
    {
        if (!environment.IsDevelopment() || !config.GetValue<bool>("Seed:Enabled")) return;
        var demos = new[] {
            (User: "lupita", Nombre: "Lupita", Cedula: "1-111-1111", Rol: RolesSistema.Administrador),
            (User: "lucia", Nombre: "Lucía", Cedula: "2-222-2222", Rol: RolesSistema.Cajero),
            (User: "angel", Nombre: "Ángel", Cedula: "3-333-3333", Rol: RolesSistema.Cocina) };
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(1437921001)", cancellationToken);
        foreach (var demo in demos)
        {
            var role = await db.Roles.SingleOrDefaultAsync(x => x.Nombre == demo.Rol, cancellationToken);
            if (role is null) { role = new Rol { Nombre = demo.Rol }; db.Roles.Add(role); }
            if (await db.Usuarios.AnyAsync(x => x.Cedula == demo.Cedula || x.NombreUsuario == demo.User, cancellationToken)) continue;
            var password = config[$"Seed:Passwords:{demo.User}"];
            if (string.IsNullOrWhiteSpace(password)) throw new InvalidOperationException($"Configura Seed:Passwords:{demo.User} mediante variables de entorno o User Secrets.");
            var user = new Usuario { RolId = role.Id, Nombre = demo.Nombre, Apellido = "Demo", Cedula = demo.Cedula, NombreUsuario = demo.User, CreadoEn = clock.UtcNow };
            user.ContrasenaHash = hasher.HashPassword(user, password);
            db.Usuarios.Add(user);
        }
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }
}
