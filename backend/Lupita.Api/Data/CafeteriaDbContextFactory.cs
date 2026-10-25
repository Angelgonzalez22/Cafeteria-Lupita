using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace Lupita.Api.Data;
public sealed class CafeteriaDbContextFactory : IDesignTimeDbContextFactory<CafeteriaDbContext>
{
    public CafeteriaDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .AddUserSecrets<CafeteriaDbContextFactory>(optional: true)
            .AddEnvironmentVariables()
            .Build();
        return new(new DbContextOptionsBuilder<CafeteriaDbContext>()
            .UseNpgsql(configuration.GetConnectionString("Postgres")
                ?? "Host=localhost;Port=5433;Database=cafeteria_lupita;Username=lupita").Options);
    }
}
