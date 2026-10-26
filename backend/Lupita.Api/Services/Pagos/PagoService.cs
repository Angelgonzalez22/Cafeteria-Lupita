using Lupita.Api.Authentication;
using Lupita.Api.Common.Concurrency;
using Lupita.Api.Common.Exceptions;
using Lupita.Api.Common.Pagination;
using Lupita.Api.Common.Responses;
using Lupita.Api.Common.Time;
using Lupita.Api.Data;
using Lupita.Api.DTOs.Pagos;
using Lupita.Api.Models;
using Lupita.Api.Services.Pedidos;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Lupita.Api.Services.Pagos;

public sealed class PagoService(CafeteriaDbContext db, IUsuarioActual usuario, IAppClock clock, IPedidoService pedidos) : IPagoService
{
    //SERVICIO PARA COBRAR UN PEDIDO COMPLETO EN EFECTIVO
    public async Task<PagoCreadoResult> CrearAsync(CrearPagoRequest request, CancellationToken cancellationToken)
    {
        if (request.Id == Guid.Empty || request.PedidoId == Guid.Empty)
            throw new BusinessException("Los UUID del pago y del pedido son obligatorios.");
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        await BloquearPagoAsync(request.Id, cancellationToken);
        var existente = await db.Pagos.AsNoTracking().SingleOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (existente is not null)
        {
            ValidarReintento(existente, request);
            var respuesta = await ObtenerAsync(existente.Id, cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return new(respuesta, false);
        }
        await PedidoConcurrency.BloquearAsync(db, request.PedidoId, cancellationToken);
        var pedido = await db.Pedidos.SingleOrDefaultAsync(x => x.Id == request.PedidoId, cancellationToken)
            ?? throw new NotFoundException("El pedido no existe.");
        if (pedido.CreadoPor != usuario.Id && (!usuario.EsAdministrador || !request.ConfirmarPedidoAjeno))
            throw new ForbiddenException("Solo puedes cobrar tus pedidos. Administración debe confirmar expresamente el cobro de un pedido ajeno.");
        if (pedido.Eliminado != 0 || pedido.CanceladoEn is not null)
            throw new BusinessException("No se puede cobrar un pedido cancelado o eliminado.");
        if (request.TotalEsperado.HasValue && request.TotalEsperado.Value != pedido.Total)
            throw new ConflictException("El importe del pedido cambió. Actualiza el detalle antes de confirmar el cobro.");
        if (request.VersionPedido is not null && request.VersionPedido != (await pedidos.ObtenerAsync(pedido.Id, cancellationToken)).Version)
            throw new ConflictException("Los detalles del pedido cambiaron. Actualízalos antes de confirmar el cobro.");
        if (pedido.EstadoPago != EstadosPedido.Pendiente ||
            await db.Pagos.AnyAsync(x => x.PedidoId == pedido.Id && !x.Anulado, cancellationToken))
            throw new ConflictException("El pedido ya tiene un cobro activo.");
        var detalles = await db.DetallesPedido.AsNoTracking().Where(x => x.PedidoId == pedido.Id && x.Eliminado == 0)
            .Select(x => new { x.Cantidad, x.PrecioUnitario, x.CostoUnitario, x.Subtotal }).ToListAsync(cancellationToken);
        if (detalles.Count == 0 || detalles.Any(x => x.Cantidad <= 0 || x.PrecioUnitario < 0 || x.CostoUnitario < 0 ||
            x.Subtotal != x.Cantidad * x.PrecioUnitario) || detalles.Sum(x => x.Subtotal) != pedido.Total)
            throw new ConflictException("El pedido no tiene detalles e importes válidos para cobrar.");
        var pago = new Pago
        {
            Id = request.Id, PedidoId = pedido.Id, Monto = pedido.Total,
            CreadoEn = clock.UtcNow, CreadoPor = usuario.Id
        };
        db.Pagos.Add(pago);
        pedido.EstadoPago = EstadosPedido.Pagado;
        pedido.ActualizadoEn = pago.CreadoEn;
        pedido.ActualizadoPor = usuario.Id;
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            var respuesta = await ObtenerAsync(pago.Id, cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return new(respuesta, true);
        }
        catch (DbUpdateException exception) when (exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            await transaction.RollbackAsync(cancellationToken);
            await transaction.DisposeAsync();
            db.ChangeTracker.Clear();
            var previo = await db.Pagos.AsNoTracking().SingleOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            if (previo is null) throw new ConflictException("El pedido ya tiene un cobro activo.");
            ValidarReintento(previo, request);
            return new(await ObtenerAsync(previo.Id, cancellationToken), false);
        }
    }

    //SERVICIO PARA TRAER LOS PAGOS CON FILTROS
    public async Task<PaginatedResponse<PagoResponse>> ListarAsync(PagoQuery query, CancellationToken cancellationToken)
    {
        var pagos = Visibles();
        if (query.EmpleadoId.HasValue)
        {
            if (!usuario.EsAdministrador && query.EmpleadoId.Value != usuario.Id)
                throw new ForbiddenException("Solo puedes consultar tus propios cobros.");
            pagos = pagos.Where(x => x.CreadoPor == query.EmpleadoId.Value);
        }
        if (query.PedidoId.HasValue) pagos = pagos.Where(x => x.PedidoId == query.PedidoId.Value);
        if (query.Anulados.HasValue) pagos = pagos.Where(x => x.Anulado == query.Anulados.Value);
        if (query.Desde.HasValue)
        {
            var desde = query.Desde.Value.UtcDateTime;
            pagos = pagos.Where(x => x.CreadoEn >= desde);
        }
        if (query.Hasta.HasValue)
        {
            var hasta = query.Hasta.Value.UtcDateTime;
            pagos = pagos.Where(x => x.CreadoEn <= hasta);
        }
        var page = await Proyectar(pagos.OrderByDescending(x => x.CreadoEn).ThenBy(x => x.Id))
            .PaginateAsync(query, "Pagos obtenidos correctamente.", cancellationToken);
        return new(page.Status, page.Titulo, page.Mensaje, page.Data.Select(Mapear).ToList(), page.Pagination);
    }

    //SERVICIO PARA TRAER EL DETALLE DE UN PAGO
    public async Task<PagoResponse> ObtenerAsync(Guid id, CancellationToken cancellationToken)
    {
        var pago = await Proyectar(Visibles().Where(x => x.Id == id)).SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("El pago no está disponible.");
        return Mapear(pago);
    }

    //SERVICIO PARA ANULAR UN PAGO CON MOTIVO
    public async Task<PagoResponse> AnularAsync(Guid id, AnularPagoRequest request, CancellationToken cancellationToken)
    {
        if (!usuario.EsAdministrador) throw new ForbiddenException("Solo el administrador puede anular pagos.");
        if (string.IsNullOrWhiteSpace(request.Motivo)) throw new BusinessException("El motivo de anulación es obligatorio.");
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        await BloquearPagoAsync(id, cancellationToken);
        var pedidoId = await db.Pagos.Where(x => x.Id == id).Select(x => (Guid?)x.PedidoId).SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("El pago no existe.");
        await PedidoConcurrency.BloquearAsync(db, pedidoId, cancellationToken);
        var pago = await db.Pagos.Include(x => x.Pedido).SingleAsync(x => x.Id == id, cancellationToken);
        if (pago.Anulado) throw new ConflictException("El pago ya está anulado.");
        if (pago.Pedido.EstadoPago != EstadosPedido.Pagado ||
            await db.Pagos.AnyAsync(x => x.PedidoId == pedidoId && !x.Anulado && x.Id != id, cancellationToken))
            throw new ConflictException("El estado del pago y del pedido no coincide.");
        pago.Anulado = true;
        pago.AnuladoEn = clock.UtcNow;
        pago.AnuladoPor = usuario.Id;
        pago.MotivoAnulacion = request.Motivo.Trim();
        pago.Pedido.EstadoPago = EstadosPedido.Pendiente;
        pago.Pedido.ActualizadoEn = pago.AnuladoEn;
        pago.Pedido.ActualizadoPor = usuario.Id;
        await db.SaveChangesAsync(cancellationToken);
        var respuesta = await ObtenerAsync(id, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return respuesta;
    }

    private Task<int> BloquearPagoAsync(Guid id, CancellationToken cancellationToken) =>
        db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({"pago:" + id}, 0))", cancellationToken);

    private IQueryable<Pago> Visibles()
    {
        var pagos = db.Pagos.AsNoTracking();
        return usuario.EsAdministrador ? pagos : pagos.Where(x => x.CreadoPor == usuario.Id);
    }

    private void ValidarReintento(Pago pago, CrearPagoRequest request)
    {
        if (pago.PedidoId != request.PedidoId || pago.CreadoPor != usuario.Id)
            throw new ConflictException("El UUID del pago ya existe con otro contenido o responsable.");
    }

    private static IQueryable<PagoData> Proyectar(IQueryable<Pago> pagos) =>
        pagos.Select(x => new PagoData(x.Id, x.PedidoId, x.Pedido.Numero, x.Monto, x.MetodoPago, x.CreadoEn,
            x.CreadoPor, x.Creador.Nombre + " " + x.Creador.Apellido, x.Anulado, x.AnuladoEn, x.AnuladoPor, x.MotivoAnulacion));

    private PagoResponse Mapear(PagoData x) => new(x.Id, x.PedidoId, x.NumeroPedido, x.Monto, x.MetodoPago,
        clock.ToLocal(x.CreadoEn), x.CreadoPor, x.CobradoPor, x.Anulado,
        x.AnuladoEn.HasValue ? clock.ToLocal(x.AnuladoEn.Value) : null, x.AnuladoPor, x.MotivoAnulacion);

    private sealed record PagoData(Guid Id, Guid PedidoId, long NumeroPedido, decimal Monto, string MetodoPago,
        DateTime CreadoEn, Guid CreadoPor, string CobradoPor, bool Anulado, DateTime? AnuladoEn,
        Guid? AnuladoPor, string? MotivoAnulacion);
}
