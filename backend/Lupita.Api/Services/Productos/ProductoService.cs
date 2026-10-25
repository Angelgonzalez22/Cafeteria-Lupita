using Lupita.Api.Authentication;
using Lupita.Api.Common.Exceptions;
using Lupita.Api.Common.Pagination;
using Lupita.Api.Common.Responses;
using Lupita.Api.Common.Time;
using Lupita.Api.Data;
using Lupita.Api.DTOs.Productos;
using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lupita.Api.Services.Productos;

public sealed class ProductoService(CafeteriaDbContext db, IUsuarioActual usuario, IAppClock clock) : IProductoService
{
    //SERVICIO PARA TRAER LOS PRODUCTOS CON FILTROS
    public async Task<PaginatedResponse<ProductoResponse>> ListarAsync(ProductoQuery query, CancellationToken cancellationToken)
    {
        var productos = db.Productos.AsNoTracking();
        if (!usuario.EsAdministrador) productos = productos.Where(x => x.Activo && x.Eliminado == 0);
        productos = Filtrar(productos, query);
        var ordenados = productos.OrderByDescending(x => x.CreadoEn).ThenBy(x => x.Id);
        if (!usuario.EsAdministrador)
            return await ProyectarVenta(ordenados).PaginateAsync(query, "Productos obtenidos correctamente.", cancellationToken);
        var page = await ProyectarAdministracion(ordenados)
            .PaginateAsync(query, "Productos obtenidos correctamente.", cancellationToken);
        return new(page.Status, page.Titulo, page.Mensaje, page.Data.Select(MapearAdministracion).ToList(), page.Pagination);
    }

    //SERVICIO PARA TRAER UN PRODUCTO
    public async Task<ProductoResponse> ObtenerAsync(Guid id, CancellationToken cancellationToken)
    {
        var productos = db.Productos.AsNoTracking().Where(x => x.Id == id);
        if (usuario.EsAdministrador)
        {
            var producto = await ProyectarAdministracion(productos).SingleOrDefaultAsync(cancellationToken)
                ?? throw new NotFoundException("El producto no está disponible.");
            return MapearAdministracion(producto);
        }
        return await ProyectarVenta(productos.Where(x => x.Activo && x.Eliminado == 0)).SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("El producto no está disponible.");
    }

    //SERVICIO PARA CREAR PRODUCTOS
    public async Task<ProductoResponse> CrearAsync(ProductoRequest request, CancellationToken cancellationToken)
    {
        var producto = new Producto { CreadoEn = clock.UtcNow, CreadoPor = usuario.Id };
        Asignar(producto, request);
        db.Productos.Add(producto);
        await db.SaveChangesAsync(cancellationToken);
        return await ObtenerAsync(producto.Id, cancellationToken);
    }

    //SERVICIO PARA EDITAR PRODUCTOS
    public async Task<ProductoResponse> EditarAsync(Guid id, ProductoRequest request, CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var producto = await BloquearAsync(id, cancellationToken);
        Asignar(producto, request);
        ActualizarAuditoria(producto);
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return await ObtenerAsync(id, cancellationToken);
    }

    //SERVICIO PARA ACTIVAR O DESACTIVAR PRODUCTOS
    public async Task<ProductoResponse> CambiarEstadoAsync(Guid id, bool activo, CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var producto = await BloquearAsync(id, cancellationToken);
        producto.Activo = activo;
        ActualizarAuditoria(producto);
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return await ObtenerAsync(id, cancellationToken);
    }

    //SERVICIO PARA ELIMINAR PRODUCTOS LOGICAMENTE
    public async Task EliminarAsync(Guid id, CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var producto = await BloquearAsync(id, cancellationToken);
        producto.Eliminado = 1;
        producto.Activo = false;
        producto.EliminadoEn = clock.UtcNow;
        producto.EliminadoPor = usuario.Id;
        ActualizarAuditoria(producto);
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    private static IQueryable<HistorialData> ProyectarAdministracion(IQueryable<Producto> productos) =>
        productos
            .Select(x => new HistorialData(x.Id, x.Nombre, x.Descripcion, x.ImagenUrl, x.Precio, x.Costo, x.Activo,
                x.CreadoEn, new ResponsableResponse(x.CreadoPor, x.Creador.Nombre + " " + x.Creador.Apellido),
                x.ActualizadoEn, x.Actualizador == null ? null : new ResponsableResponse(x.Actualizador.Id, x.Actualizador.Nombre + " " + x.Actualizador.Apellido),
                x.Eliminado != 0, x.EliminadoEn, x.Eliminador == null ? null : new ResponsableResponse(x.Eliminador.Id, x.Eliminador.Nombre + " " + x.Eliminador.Apellido)));

    private ProductoResponse MapearAdministracion(HistorialData x) =>
        new(x.Id, x.Nombre, x.ImagenUrl, x.Precio, x.Costo, x.Descripcion, x.Activo, x.Eliminado,
            clock.ToLocal(x.CreadoEn), x.CreadoPor,
            x.ActualizadoEn.HasValue ? clock.ToLocal(x.ActualizadoEn.Value) : null, x.ActualizadoPor,
            x.EliminadoEn.HasValue ? clock.ToLocal(x.EliminadoEn.Value) : null, x.EliminadoPor);

    private static IQueryable<ProductoResponse> ProyectarVenta(IQueryable<Producto> productos) =>
        productos.Select(x => new ProductoResponse(x.Id, x.Nombre, x.ImagenUrl, x.Precio,
            null, null, null, null, null, null, null, null, null, null));

    private static IQueryable<Producto> Filtrar(IQueryable<Producto> productos, ProductoQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Nombre))
        {
            var nombre = query.Nombre.Trim().ToLowerInvariant();
            productos = productos.Where(x => x.Nombre.ToLower().Contains(nombre));
        }
        if (query.Activo.HasValue) productos = productos.Where(x => x.Activo == query.Activo.Value);
        if (query.Eliminados.HasValue) productos = productos.Where(x => (x.Eliminado != 0) == query.Eliminados.Value);
        if (query.FechaInicial.HasValue)
        {
            var desde = query.FechaInicial.Value.UtcDateTime;
            productos = productos.Where(x => x.CreadoEn >= desde);
        }
        if (query.FechaFinal.HasValue)
        {
            var hasta = query.FechaFinal.Value.UtcDateTime;
            productos = productos.Where(x => x.CreadoEn <= hasta);
        }
        return productos;
    }

    private async Task<Producto> BloquearAsync(Guid id, CancellationToken cancellationToken)
        => await db.Productos.FromSqlInterpolated($"SELECT * FROM productos WHERE id = {id} FOR UPDATE")
            .SingleOrDefaultAsync(x => x.Eliminado == 0, cancellationToken)
            ?? throw new NotFoundException("El producto no está disponible.");

    private void ActualizarAuditoria(Producto producto)
    {
        producto.ActualizadoEn = clock.UtcNow;
        producto.ActualizadoPor = usuario.Id;
    }

    private static void Asignar(Producto producto, ProductoRequest request)
    {
        producto.Nombre = request.Nombre.Trim();
        producto.Descripcion = string.IsNullOrWhiteSpace(request.Descripcion) ? null : request.Descripcion.Trim();
        producto.ImagenUrl = request.ImagenUrl;
        producto.Precio = request.Precio;
        producto.Costo = request.Costo;
        producto.Activo = request.Activo;
    }

    private sealed record HistorialData(Guid Id, string Nombre, string? Descripcion, string? ImagenUrl,
        decimal Precio, decimal Costo, bool Activo, DateTime CreadoEn, ResponsableResponse CreadoPor,
        DateTime? ActualizadoEn, ResponsableResponse? ActualizadoPor, bool Eliminado,
        DateTime? EliminadoEn, ResponsableResponse? EliminadoPor);
}
