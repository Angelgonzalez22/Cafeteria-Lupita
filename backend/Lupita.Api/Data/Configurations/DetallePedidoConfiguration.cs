using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lupita.Api.Data.Configurations;

public sealed class DetallePedidoConfiguration : IEntityTypeConfiguration<DetallePedido>
{
    public void Configure(EntityTypeBuilder<DetallePedido> b)
    {
        b.ToTable("detalles_pedido", t =>
        {
            t.HasCheckConstraint("ck_detalles_cantidad", "cantidad > 0");
            t.HasCheckConstraint("ck_detalles_importes", "precio_unitario >= 0 AND costo_unitario >= 0 AND subtotal = cantidad * precio_unitario");
            t.HasCheckConstraint("ck_detalles_eliminado", "eliminado IN (0, 1)");
        });
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.PedidoId).HasColumnName("pedido_id");
        b.Property(x => x.ProductoId).HasColumnName("producto_id");
        b.Property(x => x.Cantidad).HasColumnName("cantidad");
        b.Property(x => x.PrecioUnitario).HasColumnName("precio_unitario").HasPrecision(12, 2);
        b.Property(x => x.CostoUnitario).HasColumnName("costo_unitario").HasPrecision(12, 2);
        b.Property(x => x.Subtotal).HasColumnName("subtotal").HasPrecision(12, 2);
        b.Property(x => x.Eliminado).HasColumnName("eliminado").HasDefaultValue((short)0);
        b.Property(x => x.EliminadoEn).HasColumnName("eliminado_en").HasColumnType("timestamp with time zone");
        b.Property(x => x.EliminadoPor).HasColumnName("eliminado_por");
        b.HasOne(x => x.Pedido).WithMany(x => x.Detalles).HasForeignKey(x => x.PedidoId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(x => x.Producto).WithMany().HasForeignKey(x => x.ProductoId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.EliminadoPor).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(x => new { x.PedidoId, x.ProductoId }).IsUnique().HasFilter("eliminado = 0");
    }
}
