using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace Lupita.Api.Data.Configurations;
public sealed class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> b)
    {
        b.ToTable("usuarios", t => t.HasCheckConstraint("ck_usuarios_eliminado", "eliminado IN (0, 1)")); b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.RolId).HasColumnName("rol_id");
        b.Property(x => x.Nombre).HasColumnName("nombre").HasMaxLength(100).IsRequired();
        b.Property(x => x.Apellido).HasColumnName("apellido").HasMaxLength(100).IsRequired();
        b.Property(x => x.Cedula).HasColumnName("cedula").HasMaxLength(25).IsRequired();
        b.Property(x => x.NombreUsuario).HasColumnName("usuario").HasMaxLength(50).IsRequired();
        b.Property(x => x.ContrasenaHash).HasColumnName("contrasena_hash").HasMaxLength(255).IsRequired();
        b.Property(x => x.Activo).HasColumnName("activo").HasDefaultValue(true);
        b.Property(x => x.CreadoEn).HasColumnName("creado_en").HasColumnType("timestamp with time zone");
        b.Property(x => x.ActualizadoEn).HasColumnName("actualizado_en").HasColumnType("timestamp with time zone");
        b.Property(x => x.ActualizadoPor).HasColumnName("actualizado_por");
        b.Property(x => x.Eliminado).HasColumnName("eliminado").HasDefaultValue((short)0);
        b.Property(x => x.EliminadoEn).HasColumnName("eliminado_en").HasColumnType("timestamp with time zone");
        b.Property(x => x.EliminadoPor).HasColumnName("eliminado_por");
        b.HasIndex(x => x.Cedula).IsUnique(); b.HasIndex(x => x.NombreUsuario).IsUnique();
        b.HasOne(x => x.Rol).WithMany().HasForeignKey(x => x.RolId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.ActualizadoPor).OnDelete(DeleteBehavior.Restrict);
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.EliminadoPor).OnDelete(DeleteBehavior.Restrict);
    }
}
