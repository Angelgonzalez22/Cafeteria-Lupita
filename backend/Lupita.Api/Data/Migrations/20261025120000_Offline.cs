/* ALMACENAMIENTO DURABLE PARA SINCRONIZACIÓN */
using Lupita.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lupita.Api.Data.Migrations;

[DbContext(typeof(CafeteriaDbContext))]
[Migration("20261025120000_Offline")]
public sealed class Offline : Migration
{
    protected override void Up(MigrationBuilder m)
    {
        m.CreateTable("offline_registros", table => new
        {
            Id = table.Column<Guid>(type: "uuid", nullable: false),
            UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
            DispositivoId = table.Column<Guid>(type: "uuid", nullable: false),
            Tipo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
            Contenido = table.Column<string>(type: "text", nullable: false),
            Resultado = table.Column<string>(type: "text", nullable: false),
            Estado = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
            RegistradoEn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("PK_offline_registros", x => x.Id);
            table.ForeignKey("FK_offline_registros_usuarios_UsuarioId", x => x.UsuarioId, "usuarios", "id", onDelete: ReferentialAction.Restrict);
        });
        m.CreateIndex("IX_offline_registros_UsuarioId_Tipo", "offline_registros", new[] { "UsuarioId", "Tipo" });
    }

    protected override void Down(MigrationBuilder m) => m.DropTable("offline_registros");

        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "10.0.13")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.HasSequence("pedidos_numero_seq");

            modelBuilder.Entity("Lupita.Api.Models.DetallePedido", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<int>("Cantidad")
                        .HasColumnType("integer")
                        .HasColumnName("cantidad");

                    b.Property<decimal>("CostoUnitario")
                        .HasPrecision(12, 2)
                        .HasColumnType("numeric(12,2)")
                        .HasColumnName("costo_unitario");

                    b.Property<short>("Eliminado")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("smallint")
                        .HasDefaultValue((short)0)
                        .HasColumnName("eliminado");

                    b.Property<DateTime?>("EliminadoEn")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("eliminado_en");

                    b.Property<Guid?>("EliminadoPor")
                        .HasColumnType("uuid")
                        .HasColumnName("eliminado_por");

                    b.Property<Guid>("PedidoId")
                        .HasColumnType("uuid")
                        .HasColumnName("pedido_id");

                    b.Property<decimal>("PrecioUnitario")
                        .HasPrecision(12, 2)
                        .HasColumnType("numeric(12,2)")
                        .HasColumnName("precio_unitario");

                    b.Property<Guid>("ProductoId")
                        .HasColumnType("uuid")
                        .HasColumnName("producto_id");

                    b.Property<decimal>("Subtotal")
                        .HasPrecision(12, 2)
                        .HasColumnType("numeric(12,2)")
                        .HasColumnName("subtotal");

                    b.HasKey("Id");

                    b.HasIndex("EliminadoPor");

                    b.HasIndex("ProductoId");

                    b.HasIndex("PedidoId", "ProductoId")
                        .IsUnique()
                        .HasFilter("eliminado = 0");

                    b.ToTable("detalles_pedido", null, t =>
                        {
                            t.HasCheckConstraint("ck_detalles_cantidad", "cantidad > 0");

                            t.HasCheckConstraint("ck_detalles_eliminado", "eliminado IN (0, 1)");

                            t.HasCheckConstraint("ck_detalles_importes", "precio_unitario >= 0 AND costo_unitario >= 0 AND subtotal = cantidad * precio_unitario");
                        });
                });

            modelBuilder.Entity("Lupita.Api.Models.Pago", b =>
                {
                    b.Property<Guid>("Id")
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<bool>("Anulado")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("boolean")
                        .HasDefaultValue(false)
                        .HasColumnName("anulado");

                    b.Property<DateTime?>("AnuladoEn")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("anulado_en");

                    b.Property<Guid?>("AnuladoPor")
                        .HasColumnType("uuid")
                        .HasColumnName("anulado_por");

                    b.Property<DateTime>("CreadoEn")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("creado_en");

                    b.Property<Guid>("CreadoPor")
                        .HasColumnType("uuid")
                        .HasColumnName("creado_por");

                    b.Property<string>("MetodoPago")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(30)
                        .HasColumnType("character varying(30)")
                        .HasDefaultValue("EFECTIVO")
                        .HasColumnName("metodo_pago");

                    b.Property<decimal>("Monto")
                        .HasPrecision(12, 2)
                        .HasColumnType("numeric(12,2)")
                        .HasColumnName("monto");

                    b.Property<string>("MotivoAnulacion")
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)")
                        .HasColumnName("motivo_anulacion");

                    b.Property<Guid>("PedidoId")
                        .HasColumnType("uuid")
                        .HasColumnName("pedido_id");

                    b.HasKey("Id");

                    b.HasIndex("AnuladoPor");

                    b.HasIndex("PedidoId")
                        .IsUnique()
                        .HasDatabaseName("ux_pagos_pedido_activo")
                        .HasFilter("NOT anulado");

                    b.HasIndex("CreadoEn", "Id");

                    b.HasIndex("CreadoPor", "CreadoEn");

                    b.ToTable("pagos", null, t =>
                        {
                            t.HasCheckConstraint("ck_pagos_anulacion", "(NOT anulado AND anulado_en IS NULL AND anulado_por IS NULL AND motivo_anulacion IS NULL) OR (anulado AND anulado_en IS NOT NULL AND anulado_por IS NOT NULL AND motivo_anulacion IS NOT NULL AND length(trim(motivo_anulacion)) > 0)");

                            t.HasCheckConstraint("ck_pagos_metodo", "metodo_pago = 'EFECTIVO'");

                            t.HasCheckConstraint("ck_pagos_monto", "monto >= 0");
                        });
                });

            modelBuilder.Entity("Lupita.Api.Models.Pedido", b =>
                {
                    b.Property<Guid>("Id")
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<DateTime?>("ActualizadoEn")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("actualizado_en");

                    b.Property<Guid?>("ActualizadoPor")
                        .HasColumnType("uuid")
                        .HasColumnName("actualizado_por");

                    b.Property<DateTime?>("CanceladoEn")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("cancelado_en");

                    b.Property<Guid?>("CanceladoPor")
                        .HasColumnType("uuid")
                        .HasColumnName("cancelado_por");

                    b.Property<DateTime>("CreadoEn")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("creado_en");

                    b.Property<Guid>("CreadoPor")
                        .HasColumnType("uuid")
                        .HasColumnName("creado_por");

                    b.Property<short>("Eliminado")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("smallint")
                        .HasDefaultValue((short)0)
                        .HasColumnName("eliminado");

                    b.Property<DateTime?>("EliminadoEn")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("eliminado_en");

                    b.Property<Guid?>("EliminadoPor")
                        .HasColumnType("uuid")
                        .HasColumnName("eliminado_por");

                    b.Property<string>("EstadoPago")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(20)
                        .HasColumnType("character varying(20)")
                        .HasDefaultValue("PENDIENTE")
                        .HasColumnName("estado_pago");

                    b.Property<string>("EstadoPreparacion")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(20)
                        .HasColumnType("character varying(20)")
                        .HasDefaultValue("PENDIENTE")
                        .HasColumnName("estado_preparacion");

                    b.Property<string>("MotivoCancelacion")
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)")
                        .HasColumnName("motivo_cancelacion");

                    b.Property<string>("NombreCliente")
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("nombre_cliente");

                    b.Property<long>("Numero")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasColumnName("numero")
                        .HasDefaultValueSql("nextval('pedidos_numero_seq')");

                    b.Property<string>("Referencia")
                        .IsRequired()
                        .HasMaxLength(30)
                        .HasColumnType("character varying(30)")
                        .HasColumnName("referencia");

                    b.Property<decimal>("Total")
                        .HasPrecision(12, 2)
                        .HasColumnType("numeric(12,2)")
                        .HasColumnName("total");

                    b.HasKey("Id");

                    b.HasIndex("ActualizadoPor");

                    b.HasIndex("CanceladoPor");

                    b.HasIndex("CreadoPor");

                    b.HasIndex("EliminadoPor");

                    b.HasIndex("Numero")
                        .IsUnique();

                    b.HasIndex("CreadoEn", "Id");

                    b.ToTable("pedidos", null, t =>
                        {
                            t.HasCheckConstraint("ck_pedidos_cancelacion", "(cancelado_en IS NULL AND cancelado_por IS NULL AND motivo_cancelacion IS NULL) OR (cancelado_en IS NOT NULL AND cancelado_por IS NOT NULL AND motivo_cancelacion IS NOT NULL AND length(trim(motivo_cancelacion)) > 0)");

                            t.HasCheckConstraint("ck_pedidos_eliminado", "eliminado IN (0, 1)");

                            t.HasCheckConstraint("ck_pedidos_pago", "estado_pago IN ('PENDIENTE', 'PAGADO')");

                            t.HasCheckConstraint("ck_pedidos_preparacion", "estado_preparacion IN ('PENDIENTE', 'PREPARANDO', 'LISTO')");

                            t.HasCheckConstraint("ck_pedidos_referencia", "length(trim(referencia)) > 0");

                            t.HasCheckConstraint("ck_pedidos_total", "total >= 0");
                        });
                });

            modelBuilder.Entity("Lupita.Api.Models.Producto", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<bool>("Activo")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("boolean")
                        .HasDefaultValue(true)
                        .HasColumnName("activo");

                    b.Property<DateTime?>("ActualizadoEn")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("actualizado_en");

                    b.Property<Guid?>("ActualizadoPor")
                        .HasColumnType("uuid")
                        .HasColumnName("actualizado_por");

                    b.Property<decimal>("Costo")
                        .HasPrecision(12, 2)
                        .HasColumnType("numeric(12,2)")
                        .HasColumnName("costo");

                    b.Property<DateTime>("CreadoEn")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("creado_en");

                    b.Property<Guid>("CreadoPor")
                        .HasColumnType("uuid")
                        .HasColumnName("creado_por");

                    b.Property<string>("Descripcion")
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)")
                        .HasColumnName("descripcion");

                    b.Property<short>("Eliminado")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("smallint")
                        .HasDefaultValue((short)0)
                        .HasColumnName("eliminado");

                    b.Property<DateTime?>("EliminadoEn")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("eliminado_en");

                    b.Property<Guid?>("EliminadoPor")
                        .HasColumnType("uuid")
                        .HasColumnName("eliminado_por");

                    b.Property<string>("ImagenUrl")
                        .HasMaxLength(500)
                        .HasColumnType("character varying(500)")
                        .HasColumnName("imagen_url");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasMaxLength(120)
                        .HasColumnType("character varying(120)")
                        .HasColumnName("nombre");

                    b.Property<decimal>("Precio")
                        .HasPrecision(12, 2)
                        .HasColumnType("numeric(12,2)")
                        .HasColumnName("precio");

                    b.HasKey("Id");

                    b.HasIndex("ActualizadoPor");

                    b.HasIndex("CreadoPor");

                    b.HasIndex("EliminadoPor");

                    b.HasIndex("CreadoEn", "Id");

                    b.ToTable("productos", null, t =>
                        {
                            t.HasCheckConstraint("ck_productos_costo", "costo >= 0");

                            t.HasCheckConstraint("ck_productos_eliminado", "eliminado IN (0, 1)");

                            t.HasCheckConstraint("ck_productos_nombre", "length(trim(nombre)) > 0");

                            t.HasCheckConstraint("ck_productos_precio", "precio >= 0");
                        });
                });

            modelBuilder.Entity("Lupita.Api.Models.Rol", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<string>("Descripcion")
                        .HasMaxLength(150)
                        .HasColumnType("character varying(150)")
                        .HasColumnName("descripcion");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("nombre");

                    b.HasKey("Id");

                    b.HasIndex("Nombre")
                        .IsUnique();

                    b.ToTable("roles", (string)null);

                    b.HasData(
                        new
                        {
                            Id = new Guid("10000000-0000-0000-0000-000000000001"),
                            Nombre = "ADMINISTRADOR"
                        },
                        new
                        {
                            Id = new Guid("10000000-0000-0000-0000-000000000002"),
                            Nombre = "CAJERO"
                        },
                        new
                        {
                            Id = new Guid("10000000-0000-0000-0000-000000000003"),
                            Nombre = "COCINA"
                        });
                });

            modelBuilder.Entity("Lupita.Api.Models.Usuario", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<bool>("Activo")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("boolean")
                        .HasDefaultValue(true)
                        .HasColumnName("activo");

                    b.Property<DateTime?>("ActualizadoEn")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("actualizado_en");

                    b.Property<Guid?>("ActualizadoPor")
                        .HasColumnType("uuid")
                        .HasColumnName("actualizado_por");

                    b.Property<string>("Apellido")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("apellido");

                    b.Property<string>("Cedula")
                        .IsRequired()
                        .HasMaxLength(25)
                        .HasColumnType("character varying(25)")
                        .HasColumnName("cedula");

                    b.Property<string>("ContrasenaHash")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)")
                        .HasColumnName("contrasena_hash");

                    b.Property<DateTime>("CreadoEn")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("creado_en");

                    b.Property<short>("Eliminado")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("smallint")
                        .HasDefaultValue((short)0)
                        .HasColumnName("eliminado");

                    b.Property<DateTime?>("EliminadoEn")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("eliminado_en");

                    b.Property<Guid?>("EliminadoPor")
                        .HasColumnType("uuid")
                        .HasColumnName("eliminado_por");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)")
                        .HasColumnName("nombre");

                    b.Property<string>("NombreUsuario")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)")
                        .HasColumnName("usuario");

                    b.Property<Guid>("RolId")
                        .HasColumnType("uuid")
                        .HasColumnName("rol_id");

                    b.HasKey("Id");

                    b.HasIndex("ActualizadoPor");

                    b.HasIndex("Cedula")
                        .IsUnique();

                    b.HasIndex("EliminadoPor");

                    b.HasIndex("NombreUsuario")
                        .IsUnique();

                    b.HasIndex("RolId");

                    b.ToTable("usuarios", null, t =>
                        {
                            t.HasCheckConstraint("ck_usuarios_eliminado", "eliminado IN (0, 1)");
                        });
                });

            modelBuilder.Entity("Lupita.Api.Models.DetallePedido", b =>
                {
                    b.HasOne("Lupita.Api.Models.Usuario", null)
                        .WithMany()
                        .HasForeignKey("EliminadoPor")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("Lupita.Api.Models.Pedido", "Pedido")
                        .WithMany("Detalles")
                        .HasForeignKey("PedidoId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Lupita.Api.Models.Producto", "Producto")
                        .WithMany()
                        .HasForeignKey("ProductoId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Pedido");

                    b.Navigation("Producto");
                });

            modelBuilder.Entity("Lupita.Api.Models.Pago", b =>
                {
                    b.HasOne("Lupita.Api.Models.Usuario", "Anulador")
                        .WithMany()
                        .HasForeignKey("AnuladoPor")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("Lupita.Api.Models.Usuario", "Creador")
                        .WithMany()
                        .HasForeignKey("CreadoPor")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Lupita.Api.Models.Pedido", "Pedido")
                        .WithMany()
                        .HasForeignKey("PedidoId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Anulador");

                    b.Navigation("Creador");

                    b.Navigation("Pedido");
                });

            modelBuilder.Entity("Lupita.Api.Models.Pedido", b =>
                {
                    b.HasOne("Lupita.Api.Models.Usuario", null)
                        .WithMany()
                        .HasForeignKey("ActualizadoPor")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("Lupita.Api.Models.Usuario", null)
                        .WithMany()
                        .HasForeignKey("CanceladoPor")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("Lupita.Api.Models.Usuario", "Creador")
                        .WithMany()
                        .HasForeignKey("CreadoPor")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Lupita.Api.Models.Usuario", null)
                        .WithMany()
                        .HasForeignKey("EliminadoPor")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.Navigation("Creador");
                });

            modelBuilder.Entity("Lupita.Api.Models.Producto", b =>
                {
                    b.HasOne("Lupita.Api.Models.Usuario", "Actualizador")
                        .WithMany()
                        .HasForeignKey("ActualizadoPor")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("Lupita.Api.Models.Usuario", "Creador")
                        .WithMany()
                        .HasForeignKey("CreadoPor")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Lupita.Api.Models.Usuario", "Eliminador")
                        .WithMany()
                        .HasForeignKey("EliminadoPor")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.Navigation("Actualizador");

                    b.Navigation("Creador");

                    b.Navigation("Eliminador");
                });

            modelBuilder.Entity("Lupita.Api.Models.Usuario", b =>
                {
                    b.HasOne("Lupita.Api.Models.Usuario", null)
                        .WithMany()
                        .HasForeignKey("ActualizadoPor")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("Lupita.Api.Models.Usuario", null)
                        .WithMany()
                        .HasForeignKey("EliminadoPor")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("Lupita.Api.Models.Rol", "Rol")
                        .WithMany()
                        .HasForeignKey("RolId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Rol");
                });

            modelBuilder.Entity("Lupita.Api.Models.Pedido", b =>
                {
                    b.Navigation("Detalles");
                });
            modelBuilder.Entity("Lupita.Api.Models.OfflineRecord", b =>
            {
                b.Property<Guid>("Id").HasColumnType("uuid");
                b.Property<Guid>("UsuarioId").HasColumnType("uuid");
                b.Property<Guid>("DispositivoId").HasColumnType("uuid");
                b.Property<string>("Tipo").IsRequired().HasMaxLength(30).HasColumnType("character varying(30)");
                b.Property<string>("Estado").IsRequired().HasMaxLength(30).HasColumnType("character varying(30)");
                b.Property<string>("Contenido").IsRequired().HasColumnType("text");
                b.Property<string>("Resultado").IsRequired().HasColumnType("text");
                b.Property<DateTime>("RegistradoEn").HasColumnType("timestamp with time zone");
                b.HasKey("Id");
                b.HasIndex("UsuarioId", "Tipo");
                b.ToTable("offline_registros");
                b.HasOne("Lupita.Api.Models.Usuario", null).WithMany().HasForeignKey("UsuarioId").OnDelete(DeleteBehavior.Restrict).IsRequired();
            });
#pragma warning restore 612, 618
        }
}
