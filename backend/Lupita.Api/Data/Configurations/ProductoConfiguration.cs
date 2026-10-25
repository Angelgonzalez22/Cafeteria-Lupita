using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lupita.Api.Data.Configurations;

public sealed class ProductoConfiguration : IEntityTypeConfiguration<Producto>
{
    public void Configure(EntityTypeBuilder<Producto> b)
    {
        b.ToTable("productos", t =>
        {
            t.HasCheckConstraint("ck_productos_precio", "precio >= 0");
            t.HasCheckConstraint("ck_productos_costo", "costo >= 0");
            t.HasCheckConstraint("ck_productos_nombre", "length(trim(nombre)) > 0");
            t.HasCheckConstraint("ck_productos_eliminado", "eliminado IN (0, 1)");
        });
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.Nombre).HasColumnName("nombre").HasMaxLength(120).IsRequired();
        b.Property(x => x.Descripcion).HasColumnName("descripcion").HasMaxLength(255);
        b.Property(x => x.ImagenUrl).HasColumnName("imagen_url").HasMaxLength(500);
        b.Property(x => x.Precio).HasColumnName("precio").HasPrecision(12, 2);
        b.Property(x => x.Costo).HasColumnName("costo").HasPrecision(12, 2);
        b.Property(x => x.Activo).HasColumnName("activo").HasDefaultValue(true);
        b.Property(x => x.CreadoEn).HasColumnName("creado_en").HasColumnType("timestamp with time zone");
        b.Property(x => x.CreadoPor).HasColumnName("creado_por");
        b.Property(x => x.ActualizadoEn).HasColumnName("actualizado_en").HasColumnType("timestamp with time zone");
        b.Property(x => x.ActualizadoPor).HasColumnName("actualizado_por");
        b.Property(x => x.Eliminado).HasColumnName("eliminado").HasDefaultValue((short)0);
        b.Property(x => x.EliminadoEn).HasColumnName("eliminado_en").HasColumnType("timestamp with time zone");
        b.Property(x => x.EliminadoPor).HasColumnName("eliminado_por");
        b.HasOne(x => x.Creador).WithMany().HasForeignKey(x => x.CreadoPor).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(x => x.Actualizador).WithMany().HasForeignKey(x => x.ActualizadoPor).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(x => x.Eliminador).WithMany().HasForeignKey(x => x.EliminadoPor).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(x => new { x.CreadoEn, x.Id });
    }
}
