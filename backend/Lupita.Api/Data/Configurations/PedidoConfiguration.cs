using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lupita.Api.Data.Configurations;

public sealed class PedidoConfiguration : IEntityTypeConfiguration<Pedido>
{
    public void Configure(EntityTypeBuilder<Pedido> b)
    {
        b.ToTable("pedidos", t =>
        {
            t.HasCheckConstraint("ck_pedidos_total", "total >= 0");
            t.HasCheckConstraint("ck_pedidos_referencia", "length(trim(referencia)) > 0");
            t.HasCheckConstraint("ck_pedidos_preparacion", "estado_preparacion IN ('PENDIENTE', 'PREPARANDO', 'LISTO')");
            t.HasCheckConstraint("ck_pedidos_pago", "estado_pago IN ('PENDIENTE', 'PAGADO')");
            t.HasCheckConstraint("ck_pedidos_eliminado", "eliminado IN (0, 1)");
            t.HasCheckConstraint("ck_pedidos_cancelacion", "(cancelado_en IS NULL AND cancelado_por IS NULL AND motivo_cancelacion IS NULL) OR (cancelado_en IS NOT NULL AND cancelado_por IS NOT NULL AND motivo_cancelacion IS NOT NULL AND length(trim(motivo_cancelacion)) > 0)");
        });
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
        b.Property(x => x.Numero).HasColumnName("numero").HasDefaultValueSql("nextval('pedidos_numero_seq')");
        b.HasIndex(x => x.Numero).IsUnique();
        b.Property(x => x.Referencia).HasColumnName("referencia").HasMaxLength(30).IsRequired();
        b.Property(x => x.NombreCliente).HasColumnName("nombre_cliente").HasMaxLength(100);
        b.Property(x => x.EstadoPreparacion).HasColumnName("estado_preparacion").HasMaxLength(20).HasDefaultValue(EstadosPedido.Pendiente);
        b.Property(x => x.EstadoPago).HasColumnName("estado_pago").HasMaxLength(20).HasDefaultValue(EstadosPedido.Pendiente);
        b.Property(x => x.Total).HasColumnName("total").HasPrecision(12, 2);
        b.Property(x => x.CreadoEn).HasColumnName("creado_en").HasColumnType("timestamp with time zone");
        b.Property(x => x.CreadoPor).HasColumnName("creado_por");
        b.Property(x => x.ActualizadoEn).HasColumnName("actualizado_en").HasColumnType("timestamp with time zone");
        b.Property(x => x.ActualizadoPor).HasColumnName("actualizado_por");
        b.Property(x => x.CanceladoEn).HasColumnName("cancelado_en").HasColumnType("timestamp with time zone");
        b.Property(x => x.CanceladoPor).HasColumnName("cancelado_por");
        b.Property(x => x.MotivoCancelacion).HasColumnName("motivo_cancelacion").HasMaxLength(255);
        b.Property(x => x.Eliminado).HasColumnName("eliminado").HasDefaultValue((short)0);
        b.Property(x => x.EliminadoEn).HasColumnName("eliminado_en").HasColumnType("timestamp with time zone");
        b.Property(x => x.EliminadoPor).HasColumnName("eliminado_por");
        b.HasOne(x => x.Creador).WithMany().HasForeignKey(x => x.CreadoPor).OnDelete(DeleteBehavior.Restrict);
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.ActualizadoPor).OnDelete(DeleteBehavior.Restrict);
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.CanceladoPor).OnDelete(DeleteBehavior.Restrict);
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.EliminadoPor).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(x => new { x.CreadoEn, x.Id });
    }
}
