using Lupita.Api.Authentication;
using Lupita.Api.Common.Concurrency;
using Lupita.Api.Common.Exceptions;
using Lupita.Api.Common.Pagination;
using Lupita.Api.Common.Responses;
using Lupita.Api.Common.Time;
using Lupita.Api.Data;
using Lupita.Api.DTOs.Pedidos;
using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Lupita.Api.Services.Pedidos;

public sealed class PedidoService(CafeteriaDbContext db, IUsuarioActual usuario, IAppClock clock) : IPedidoService
{
    private const decimal ImporteMaximo = 9999999999.99m;

    //SERVICIO PARA CREAR PEDIDOS CON SUS DETALLES
    public async Task<PedidoCreadoResult> CrearAsync(CrearPedidoRequest request, CancellationToken cancellationToken)
    {
        ValidarDetalles(request);
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        await BloquearAsync(request.Id, cancellationToken);
        var existente = await db.Pedidos.AsNoTracking().Include(x => x.Detalles)
            .SingleOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (existente is not null)
        {
            ValidarReintento(existente, request);
            var respuesta = await ObtenerAsync(existente.Id, cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return new(respuesta, false);
        }
        var productos = await ProductosDisponiblesAsync(request.Detalles, cancellationToken);
        var pedido = new Pedido
        {
            Id = request.Id, Referencia = request.Referencia.Trim(), NombreCliente = Limpiar(request.NombreCliente),
            CreadoEn = clock.UtcNow, CreadoPor = usuario.Id
        };
        foreach (var item in request.Detalles)
        {
            var producto = productos[item.ProductoId];
            pedido.Detalles.Add(new DetallePedido
            {
                ProductoId = producto.Id, Cantidad = item.Cantidad, PrecioUnitario = producto.Precio,
                CostoUnitario = producto.Costo, Subtotal = Subtotal(item.Cantidad, producto.Precio)
            });
        }
        pedido.Total = Total(pedido.Detalles);
        db.Pedidos.Add(pedido);
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            var respuesta = await ObtenerAsync(pedido.Id, cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return new(respuesta, true);
        }
        catch (DbUpdateException exception) when (exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            await transaction.RollbackAsync(cancellationToken);
            await transaction.DisposeAsync();
            db.ChangeTracker.Clear();
            var previo = await db.Pedidos.AsNoTracking().Include(x => x.Detalles)
                .SingleOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            if (previo is null) throw new ConflictException("El pedido entró en conflicto con otra operación.");
            ValidarReintento(previo, request);
            return new(await ObtenerAsync(previo.Id, cancellationToken), false);
        }
    }

    //SERVICIO PARA TRAER EL DETALLE DE UN PEDIDO
    public async Task<PedidoResponse> ObtenerAsync(Guid id, CancellationToken cancellationToken)
    {
        var pedido = await db.Pedidos.AsNoTracking().Where(x => x.Id == id && x.Eliminado == 0)
            .Select(x => new PedidoData(x.Id, x.Numero, x.Referencia, x.NombreCliente,
                x.Creador.Nombre + " " + x.Creador.Apellido, x.EstadoPreparacion, x.EstadoPago,
                x.Detalles.Where(d => d.Eliminado == 0).OrderBy(d => d.Id)
                    .Select(d => new DetallePedidoResponse(d.ProductoId, d.Producto.Nombre, d.Cantidad, d.PrecioUnitario, d.Subtotal)).ToList(),
                x.Total, x.CreadoEn, x.CanceladoEn, x.MotivoCancelacion))
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("El pedido no está disponible.");
        return new(pedido.Id, pedido.Numero, pedido.Referencia, pedido.NombreCliente,
            pedido.NombreCliente ?? pedido.Referencia, pedido.AtendidoPor, pedido.EstadoPreparacion,
            pedido.EstadoPago, pedido.Detalles, pedido.Total, clock.ToLocal(pedido.CreadoEn),
            pedido.CanceladoEn.HasValue ? clock.ToLocal(pedido.CanceladoEn.Value) : null, pedido.MotivoCancelacion);
    }

    //SERVICIO PARA TRAER LOS PEDIDOS CON FILTROS
    public async Task<PaginatedResponse<PedidoListadoResponse>> ListarAsync(PedidoQuery query, CancellationToken cancellationToken)
    {
        if (query.EmpleadoId.HasValue && !usuario.EsAdministrador)
            throw new ForbiddenException("No tienes permisos para filtrar por empleado.");
        var pedidos = db.Pedidos.AsNoTracking();
        if (query.Eliminados.HasValue) pedidos = pedidos.Where(x => (x.Eliminado != 0) == query.Eliminados.Value);
        if (query.Cancelados.HasValue) pedidos = pedidos.Where(x => (x.CanceladoEn != null) == query.Cancelados.Value);
        if (query.EmpleadoId.HasValue) pedidos = pedidos.Where(x => x.CreadoPor == query.EmpleadoId.Value);
        if (query.EstadoPreparacion is not null) pedidos = pedidos.Where(x => x.EstadoPreparacion == query.EstadoPreparacion);
        if (query.EstadoPago is not null) pedidos = pedidos.Where(x => x.EstadoPago == query.EstadoPago);
        if (!string.IsNullOrWhiteSpace(query.Referencia))
        {
            var referencia = query.Referencia.Trim().ToLowerInvariant();
            pedidos = pedidos.Where(x => x.Referencia.ToLower().Contains(referencia));
        }
        if (!string.IsNullOrWhiteSpace(query.Cliente))
        {
            var cliente = query.Cliente.Trim().ToLowerInvariant();
            pedidos = pedidos.Where(x => x.NombreCliente != null && x.NombreCliente.ToLower().Contains(cliente));
        }
        if (query.FechaInicial.HasValue)
        {
            var desde = query.FechaInicial.Value.UtcDateTime;
            pedidos = pedidos.Where(x => x.CreadoEn >= desde);
        }
        if (query.FechaFinal.HasValue)
        {
            var hasta = query.FechaFinal.Value.UtcDateTime;
            pedidos = pedidos.Where(x => x.CreadoEn <= hasta);
        }
        var page = await pedidos.OrderByDescending(x => x.CreadoEn).ThenByDescending(x => x.Numero)
            .Select(x => new ListadoData(x.Id, x.Numero, x.NombreCliente ?? x.Referencia,
                x.Creador.Nombre + " " + x.Creador.Apellido, x.Total, x.EstadoPreparacion, x.EstadoPago,
                x.CreadoEn, x.CanceladoEn != null, x.Eliminado != 0))
            .PaginateAsync(query, "Pedidos obtenidos correctamente.", cancellationToken);
        return new(page.Status, page.Titulo, page.Mensaje,
            page.Data.Select(x => new PedidoListadoResponse(x.Id, x.Numero, x.Cliente, x.AtendidoPor,
                x.Total, x.EstadoPreparacion, x.EstadoPago, clock.ToLocal(x.CreadoEn), x.Cancelado, x.Eliminado)).ToList(),
            page.Pagination);
    }

    //SERVICIO PARA EDITAR PEDIDOS PENDIENTES
    public async Task<PedidoResponse> EditarAsync(Guid id, EditarPedidoRequest request, CancellationToken cancellationToken)
    {
        ValidarDetalles(request);
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        await BloquearAsync(id, cancellationToken);
        var pedido = await CargarAsync(id, cancellationToken);
        if (pedido.CanceladoEn is not null || pedido.EstadoPreparacion != EstadosPedido.Pendiente ||
            pedido.EstadoPago != EstadosPedido.Pendiente)
            throw new BusinessException("Solo se pueden editar pedidos pendientes, sin pagar y sin cancelar.");
        var productos = await ProductosDisponiblesAsync(request.Detalles, cancellationToken);
        var anteriores = pedido.Detalles.Where(x => x.Eliminado == 0).ToDictionary(x => x.ProductoId);
        var solicitados = request.Detalles.Select(x => x.ProductoId).ToHashSet();
        var ahora = clock.UtcNow;
        foreach (var detalle in anteriores.Values.Where(x => !solicitados.Contains(x.ProductoId)))
        {
            detalle.Eliminado = 1;
            detalle.EliminadoEn = ahora;
            detalle.EliminadoPor = usuario.Id;
        }
        foreach (var item in request.Detalles)
        {
            if (anteriores.TryGetValue(item.ProductoId, out var detalle))
            {
                detalle.Cantidad = item.Cantidad;
                detalle.Subtotal = Subtotal(item.Cantidad, detalle.PrecioUnitario);
            }
            else
            {
                var producto = productos[item.ProductoId];
                var nuevoDetalle = new DetallePedido
                {
                    ProductoId = producto.Id, Cantidad = item.Cantidad, PrecioUnitario = producto.Precio,
                    CostoUnitario = producto.Costo, Subtotal = Subtotal(item.Cantidad, producto.Precio)
                };
                db.DetallesPedido.Add(nuevoDetalle);
                pedido.Detalles.Add(nuevoDetalle);
            }
        }
        pedido.Referencia = request.Referencia.Trim();
        pedido.NombreCliente = Limpiar(request.NombreCliente);
        pedido.Total = Total(pedido.Detalles);
        pedido.ActualizadoEn = ahora;
        pedido.ActualizadoPor = usuario.Id;
        await db.SaveChangesAsync(cancellationToken);
        var respuesta = await ObtenerAsync(id, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return respuesta;
    }

    //SERVICIO PARA CANCELAR PEDIDOS SIN PAGAR
    public async Task<PedidoResponse> CancelarAsync(Guid id, CancelarPedidoRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Motivo)) throw new BusinessException("El motivo de cancelación es obligatorio.");
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        await BloquearAsync(id, cancellationToken);
        var pedido = await CargarAsync(id, cancellationToken);
        if (pedido.EstadoPago != EstadosPedido.Pendiente)
            throw new BusinessException("No se puede cancelar un pedido pagado.");
        if (pedido.CanceladoEn is not null) throw new ConflictException("El pedido ya está cancelado.");
        if (pedido.EstadoPreparacion != EstadosPedido.Pendiente && !usuario.EsAdministrador)
            throw new ForbiddenException("Solo el administrador puede cancelar pedidos que ya están en preparación o listos.");
        pedido.CanceladoEn = clock.UtcNow;
        pedido.CanceladoPor = usuario.Id;
        pedido.MotivoCancelacion = request.Motivo.Trim();
        pedido.ActualizadoEn = pedido.CanceladoEn;
        pedido.ActualizadoPor = usuario.Id;
        await db.SaveChangesAsync(cancellationToken);
        var respuesta = await ObtenerAsync(id, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return respuesta;
    }

    private Task BloquearAsync(Guid id, CancellationToken cancellationToken) =>
        PedidoConcurrency.BloquearAsync(db, id, cancellationToken);

    private async Task<Pedido> CargarAsync(Guid id, CancellationToken cancellationToken) =>
        await db.Pedidos.Include(x => x.Detalles).SingleOrDefaultAsync(x => x.Id == id && x.Eliminado == 0, cancellationToken)
        ?? throw new NotFoundException("El pedido no está disponible.");

    private async Task<Dictionary<Guid, ProductoPrecio>> ProductosDisponiblesAsync(
        IReadOnlyList<DetallePedidoRequest> detalles, CancellationToken cancellationToken)
    {
        var ids = detalles.Select(x => x.ProductoId).ToArray();
        var productos = await db.Productos.AsNoTracking()
            .Where(x => ids.Contains(x.Id) && x.Activo && x.Eliminado == 0)
            .Select(x => new ProductoPrecio(x.Id, x.Precio, x.Costo))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
        if (productos.Count != ids.Length)
            throw new BusinessException("Uno o más productos no existen, están inactivos o fueron eliminados.");
        return productos;
    }

    private void ValidarReintento(Pedido pedido, CrearPedidoRequest request)
    {
        var detalles = pedido.Detalles.Where(x => x.Eliminado == 0).OrderBy(x => x.ProductoId)
            .Select(x => (x.ProductoId, x.Cantidad));
        var recibidos = request.Detalles.OrderBy(x => x.ProductoId).Select(x => (x.ProductoId, x.Cantidad));
        if (pedido.Eliminado != 0 || pedido.CreadoPor != usuario.Id || pedido.Referencia != request.Referencia.Trim() ||
            pedido.NombreCliente != Limpiar(request.NombreCliente) || !detalles.SequenceEqual(recibidos))
            throw new ConflictException("El UUID del pedido ya existe con un contenido diferente.");
    }

    private static void ValidarDetalles(EditarPedidoRequest request)
    {
        if (request is CrearPedidoRequest crear && crear.Id == Guid.Empty)
            throw new BusinessException("El UUID del pedido es obligatorio.");
        if (string.IsNullOrWhiteSpace(request.Referencia) || request.Detalles is null ||
            request.Detalles.Count is < 1 or > 100 || request.Detalles.Any(x => x is null || x.ProductoId == Guid.Empty || x.Cantidad < 1) ||
            request.Detalles.Select(x => x.ProductoId).Distinct().Count() != request.Detalles.Count)
            throw new BusinessException("Verifica la referencia, los productos y sus cantidades.");
    }

    private static string? Limpiar(string? texto) => string.IsNullOrWhiteSpace(texto) ? null : texto.Trim();

    private static decimal Subtotal(int cantidad, decimal precio)
    {
        var subtotal = cantidad * precio;
        if (subtotal > ImporteMaximo) throw new BusinessException("El importe del detalle supera el máximo permitido.");
        return subtotal;
    }

    private static decimal Total(IEnumerable<DetallePedido> detalles)
    {
        var total = detalles.Where(x => x.Eliminado == 0).Sum(x => x.Subtotal);
        if (total > ImporteMaximo) throw new BusinessException("El total del pedido supera el máximo permitido.");
        return total;
    }

    private sealed record PedidoData(Guid Id, long Numero, string Referencia, string? NombreCliente, string AtendidoPor,
        string EstadoPreparacion, string EstadoPago, List<DetallePedidoResponse> Detalles, decimal Total,
        DateTime CreadoEn, DateTime? CanceladoEn, string? MotivoCancelacion);

    private sealed record ListadoData(Guid Id, long Numero, string Cliente, string AtendidoPor, decimal Total,
        string EstadoPreparacion, string EstadoPago, DateTime CreadoEn, bool Cancelado, bool Eliminado);

    private sealed record ProductoPrecio(Guid Id, decimal Precio, decimal Costo);
}
