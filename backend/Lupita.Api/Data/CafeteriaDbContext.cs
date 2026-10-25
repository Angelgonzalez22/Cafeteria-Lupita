using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;
namespace Lupita.Api.Data;
public sealed class CafeteriaDbContext(DbContextOptions<CafeteriaDbContext> options) : DbContext(options)
{
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<DetallePedido> DetallesPedido => Set<DetallePedido>();
    public DbSet<Pago> Pagos => Set<Pago>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasSequence<long>("pedidos_numero_seq");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CafeteriaDbContext).Assembly);
    }
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => SaveChangesAsync(true, cancellationToken);
    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        ValidarEliminaciones();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }
    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ValidarEliminaciones();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }
    private void ValidarEliminaciones()
    {
        if (ChangeTracker.Entries().Any(e => e.State == EntityState.Deleted &&
            e.Entity is Usuario or Producto or Pedido or DetallePedido or Pago))
            throw new InvalidOperationException("Los registros requieren eliminación lógica.");
    }
}
