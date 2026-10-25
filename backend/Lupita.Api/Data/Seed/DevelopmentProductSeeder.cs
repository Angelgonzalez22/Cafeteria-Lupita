using Lupita.Api.Authentication;
using Lupita.Api.Common.Time;
using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lupita.Api.Data.Seed;

public sealed class DevelopmentProductSeeder(
    CafeteriaDbContext db, IAppClock clock, IConfiguration config, IHostEnvironment environment)
{
    public async Task SeedAsync(CancellationToken cancellationToken)
    {
        if (!environment.IsDevelopment() || !config.GetValue<bool>("Seed:Enabled")) return;
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(1437921002)", cancellationToken);
        var productos = new[]
        {
            (Id: Guid.Parse("20000000-0000-0000-0000-000000000001"), Nombre: "Café con leche",
                Url: "https://www.196flavors.com/wp-content/uploads/2024/02/Cafe-con-leche-1.jpg.webp", Precio: 1.50m, Costo: 0.65m),
            (Id: Guid.Parse("20000000-0000-0000-0000-000000000002"), Nombre: "Empanada de pollo",
                Url: "https://ariztia.com/wp-content/uploads/2023/11/empanada-de-pollo-1.jpg", Precio: 2.00m, Costo: 0.85m),
            (Id: Guid.Parse("20000000-0000-0000-0000-000000000003"), Nombre: "Emparedado de queso",
                Url: "https://saborgourmet.com/wp-content/uploads/2018/07/4.jpg", Precio: 2.50m, Costo: 1.10m)
        };
        var ids = productos.Select(x => x.Id).ToArray();
        var existentes = await db.Productos.Where(x => ids.Contains(x.Id)).Select(x => x.Id).ToListAsync(cancellationToken);
        var faltantes = productos.Where(x => !existentes.Contains(x.Id)).ToArray();
        if (faltantes.Length == 0)
        {
            await transaction.CommitAsync(cancellationToken);
            return;
        }
        var administrador = await db.Usuarios.Where(x => x.NombreUsuario == "lupita" &&
            x.Eliminado == 0 && x.Rol.Nombre == RolesSistema.Administrador)
            .Select(x => (Guid?)x.Id).SingleOrDefaultAsync(cancellationToken)
            ?? throw new InvalidOperationException("La inicialización de productos requiere la cuenta administradora de desarrollo lupita.");
        foreach (var demo in faltantes)
        {
            db.Productos.Add(new Producto
            {
                Id = demo.Id, Nombre = demo.Nombre, ImagenUrl = demo.Url, Precio = demo.Precio, Costo = demo.Costo,
                Descripcion = "Producto de demostración con precio y costo de referencia.",
                CreadoEn = clock.UtcNow, CreadoPor = administrador
            });
        }
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }
}
