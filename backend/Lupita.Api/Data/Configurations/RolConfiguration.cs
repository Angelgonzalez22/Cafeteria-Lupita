using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace Lupita.Api.Data.Configurations;
public sealed class RolConfiguration : IEntityTypeConfiguration<Rol>
{
    public void Configure(EntityTypeBuilder<Rol> b)
    {
        b.ToTable("roles"); b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.Nombre).HasColumnName("nombre").HasMaxLength(50).IsRequired();
        b.Property(x => x.Descripcion).HasColumnName("descripcion").HasMaxLength(150);
        b.HasIndex(x => x.Nombre).IsUnique();
        b.HasData(
            new Rol { Id = Guid.Parse("10000000-0000-0000-0000-000000000001"), Nombre = "ADMINISTRADOR" },
            new Rol { Id = Guid.Parse("10000000-0000-0000-0000-000000000002"), Nombre = "CAJERO" },
            new Rol { Id = Guid.Parse("10000000-0000-0000-0000-000000000003"), Nombre = "COCINA" });
    }
}
