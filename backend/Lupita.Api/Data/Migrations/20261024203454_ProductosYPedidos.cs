using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Lupita.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Lupita.Api.Data.Migrations
{
    public partial class ProductosYPedidos : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "pedidos_numero_seq");

            migrationBuilder.CreateTable(
                name: "pedidos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    numero = table.Column<long>(type: "bigint", nullable: false, defaultValueSql: "nextval('pedidos_numero_seq')"),
                    referencia = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    nombre_cliente = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    estado_preparacion = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "PENDIENTE"),
                    estado_pago = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "PENDIENTE"),
                    total = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    creado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    creado_por = table.Column<Guid>(type: "uuid", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actualizado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    cancelado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancelado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    motivo_cancelacion = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    eliminado = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    eliminado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    eliminado_por = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pedidos", x => x.id);
                    table.CheckConstraint("ck_pedidos_cancelacion", "(cancelado_en IS NULL AND cancelado_por IS NULL AND motivo_cancelacion IS NULL) OR (cancelado_en IS NOT NULL AND cancelado_por IS NOT NULL AND motivo_cancelacion IS NOT NULL AND length(trim(motivo_cancelacion)) > 0)");
                    table.CheckConstraint("ck_pedidos_eliminado", "eliminado IN (0, 1)");
                    table.CheckConstraint("ck_pedidos_pago", "estado_pago IN ('PENDIENTE', 'PAGADO')");
                    table.CheckConstraint("ck_pedidos_preparacion", "estado_preparacion IN ('PENDIENTE', 'PREPARANDO', 'LISTO')");
                    table.CheckConstraint("ck_pedidos_referencia", "length(trim(referencia)) > 0");
                    table.CheckConstraint("ck_pedidos_total", "total >= 0");
                    table.ForeignKey(
                        name: "FK_pedidos_usuarios_actualizado_por",
                        column: x => x.actualizado_por,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_pedidos_usuarios_cancelado_por",
                        column: x => x.cancelado_por,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_pedidos_usuarios_creado_por",
                        column: x => x.creado_por,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_pedidos_usuarios_eliminado_por",
                        column: x => x.eliminado_por,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "productos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    imagen_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    precio = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    costo = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    creado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    creado_por = table.Column<Guid>(type: "uuid", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actualizado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    eliminado = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    eliminado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    eliminado_por = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_productos", x => x.id);
                    table.CheckConstraint("ck_productos_costo", "costo >= 0");
                    table.CheckConstraint("ck_productos_eliminado", "eliminado IN (0, 1)");
                    table.CheckConstraint("ck_productos_nombre", "length(trim(nombre)) > 0");
                    table.CheckConstraint("ck_productos_precio", "precio >= 0");
                    table.ForeignKey(
                        name: "FK_productos_usuarios_actualizado_por",
                        column: x => x.actualizado_por,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_productos_usuarios_creado_por",
                        column: x => x.creado_por,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_productos_usuarios_eliminado_por",
                        column: x => x.eliminado_por,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "detalles_pedido",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    pedido_id = table.Column<Guid>(type: "uuid", nullable: false),
                    producto_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cantidad = table.Column<int>(type: "integer", nullable: false),
                    precio_unitario = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    costo_unitario = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    subtotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    eliminado = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    eliminado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    eliminado_por = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_detalles_pedido", x => x.id);
                    table.CheckConstraint("ck_detalles_cantidad", "cantidad > 0");
                    table.CheckConstraint("ck_detalles_eliminado", "eliminado IN (0, 1)");
                    table.CheckConstraint("ck_detalles_importes", "precio_unitario >= 0 AND costo_unitario >= 0 AND subtotal = cantidad * precio_unitario");
                    table.ForeignKey(
                        name: "FK_detalles_pedido_pedidos_pedido_id",
                        column: x => x.pedido_id,
                        principalTable: "pedidos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_detalles_pedido_productos_producto_id",
                        column: x => x.producto_id,
                        principalTable: "productos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_detalles_pedido_usuarios_eliminado_por",
                        column: x => x.eliminado_por,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_detalles_pedido_eliminado_por",
                table: "detalles_pedido",
                column: "eliminado_por");

            migrationBuilder.CreateIndex(
                name: "IX_detalles_pedido_pedido_id_producto_id",
                table: "detalles_pedido",
                columns: new[] { "pedido_id", "producto_id" },
                unique: true,
                filter: "eliminado = 0");

            migrationBuilder.CreateIndex(
                name: "IX_detalles_pedido_producto_id",
                table: "detalles_pedido",
                column: "producto_id");

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_actualizado_por",
                table: "pedidos",
                column: "actualizado_por");

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_cancelado_por",
                table: "pedidos",
                column: "cancelado_por");

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_creado_en_id",
                table: "pedidos",
                columns: new[] { "creado_en", "id" });

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_creado_por",
                table: "pedidos",
                column: "creado_por");

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_eliminado_por",
                table: "pedidos",
                column: "eliminado_por");

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_numero",
                table: "pedidos",
                column: "numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_productos_actualizado_por",
                table: "productos",
                column: "actualizado_por");

            migrationBuilder.CreateIndex(
                name: "IX_productos_creado_en_id",
                table: "productos",
                columns: new[] { "creado_en", "id" });

            migrationBuilder.CreateIndex(
                name: "IX_productos_creado_por",
                table: "productos",
                column: "creado_por");

            migrationBuilder.CreateIndex(
                name: "IX_productos_eliminado_por",
                table: "productos",
                column: "eliminado_por");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "detalles_pedido");

            migrationBuilder.DropTable(
                name: "pedidos");

            migrationBuilder.DropTable(
                name: "productos");

            migrationBuilder.DropSequence(
                name: "pedidos_numero_seq");
        }
    }
}

#nullable disable

namespace Lupita.Api.Data.Migrations
{
    [DbContext(typeof(CafeteriaDbContext))]
    [Migration("20261024203454_ProductosYPedidos")]
    partial class ProductosYPedidos
    {
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
#pragma warning restore 612, 618
        }
    }
}

#nullable disable

