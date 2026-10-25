using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Lupita.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814

namespace Lupita.Api.Data.Migrations
{
    public partial class AutenticacionInicial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    rol_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    apellido = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    cedula = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    usuario = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    contrasena_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    creado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actualizado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    eliminado = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    eliminado_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    eliminado_por = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.id);
                    table.CheckConstraint("ck_usuarios_eliminado", "eliminado IN (0, 1)");
                    table.ForeignKey(
                        name: "FK_usuarios_roles_rol_id",
                        column: x => x.rol_id,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_usuarios_usuarios_actualizado_por",
                        column: x => x.actualizado_por,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_usuarios_usuarios_eliminado_por",
                        column: x => x.eliminado_por,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "roles",
                columns: new[] { "id", "descripcion", "nombre" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), null, "ADMINISTRADOR" },
                    { new Guid("10000000-0000-0000-0000-000000000002"), null, "CAJERO" },
                    { new Guid("10000000-0000-0000-0000-000000000003"), null, "COCINA" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_roles_nombre",
                table: "roles",
                column: "nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_actualizado_por",
                table: "usuarios",
                column: "actualizado_por");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_cedula",
                table: "usuarios",
                column: "cedula",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_eliminado_por",
                table: "usuarios",
                column: "eliminado_por");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_rol_id",
                table: "usuarios",
                column: "rol_id");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_usuario",
                table: "usuarios",
                column: "usuario",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "usuarios");

            migrationBuilder.DropTable(
                name: "roles");
        }
    }
}

#nullable disable

namespace Lupita.Api.Data.Migrations
{
    [DbContext(typeof(CafeteriaDbContext))]
    [Migration("20261024191846_AutenticacionInicial")]
    partial class AutenticacionInicial
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "10.0.13")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

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
#pragma warning restore 612, 618
        }
    }
}

#nullable disable

