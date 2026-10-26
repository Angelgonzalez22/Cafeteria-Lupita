/* CONFIGURACIÓN DEL REGISTRO OFFLINE */
using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lupita.Api.Data.Configurations;

public sealed class OfflineRecordConfiguration : IEntityTypeConfiguration<OfflineRecord>
{
    public void Configure(EntityTypeBuilder<OfflineRecord> b)
    {
        b.ToTable("offline_registros");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever();
        b.Property(x => x.Tipo).HasMaxLength(30);
        b.Property(x => x.Estado).HasMaxLength(30);
        b.Property(x => x.Contenido).HasColumnType("text");
        b.Property(x => x.Resultado).HasColumnType("text");
        b.HasIndex(x => new { x.UsuarioId, x.Tipo });
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.Restrict);
    }
}
