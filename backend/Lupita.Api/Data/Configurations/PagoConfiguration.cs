using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lupita.Api.Data.Configurations;

public sealed class PagoConfiguration : IEntityTypeConfiguration<Pago>
{
    public void Configure(EntityTypeBuilder<Pago> b)
    {
        b.ToTable("pagos", t =>
        {
            t.HasCheckConstraint("ck_pagos_monto", "monto >= 0");
            t.HasCheckConstraint("ck_pagos_metodo", "metodo_pago = 'EFECTIVO'");
            t.HasCheckConstraint("ck_pagos_anulacion", "(NOT anulado AND anulado_en IS NULL AND anulado_por IS NULL AND motivo_anulacion IS NULL) OR (anulado AND anulado_en IS NOT NULL AND anulado_por IS NOT NULL AND motivo_anulacion IS NOT NULL AND length(trim(motivo_anulacion)) > 0)");
        });
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
        b.Property(x => x.PedidoId).HasColumnName("pedido_id");
        b.Property(x => x.Monto).HasColumnName("monto").HasPrecision(12, 2);
        b.Property(x => x.MetodoPago).HasColumnName("metodo_pago").HasMaxLength(30).HasDefaultValue("EFECTIVO");
        b.Property(x => x.CreadoEn).HasColumnName("creado_en").HasColumnType("timestamp with time zone");
        b.Property(x => x.CreadoPor).HasColumnName("creado_por");
        b.Property(x => x.Anulado).HasColumnName("anulado").HasDefaultValue(false);
        b.Property(x => x.AnuladoEn).HasColumnName("anulado_en").HasColumnType("timestamp with time zone");
        b.Property(x => x.AnuladoPor).HasColumnName("anulado_por");
        b.Property(x => x.MotivoAnulacion).HasColumnName("motivo_anulacion").HasMaxLength(255);
        b.HasOne(x => x.Pedido).WithMany().HasForeignKey(x => x.PedidoId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(x => x.Creador).WithMany().HasForeignKey(x => x.CreadoPor).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(x => x.Anulador).WithMany().HasForeignKey(x => x.AnuladoPor).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(x => x.PedidoId).IsUnique().HasFilter("NOT anulado").HasDatabaseName("ux_pagos_pedido_activo");
        b.HasIndex(x => new { x.CreadoEn, x.Id });
        b.HasIndex(x => new { x.CreadoPor, x.CreadoEn });
    }
}
