/* DESCARGA Y APLICACIÓN TRANSACCIONAL DE OPERACIONES OFFLINE */
using System.Text.Json;
using System.Data;
using Lupita.Api.Authentication;
using Lupita.Api.Common.Concurrency;
using Lupita.Api.Common.Exceptions;
using Lupita.Api.Common.Time;
using Lupita.Api.Data;
using Lupita.Api.DTOs.Pedidos;
using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lupita.Api.Services.Pedidos;

public sealed class OfflineService(CafeteriaDbContext db, IUsuarioActual user, IAppClock clock, IPedidoService pedidos)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private async Task<OfflineRecord> Device(Guid device, CancellationToken ct, bool authorize = false)
    {
        if (device == Guid.Empty) throw new BusinessException("El dispositivo es obligatorio.");
        var lease = await db.OfflineRegistros.SingleOrDefaultAsync(x => x.Id == user.Id && x.Tipo == "dispositivo", ct);
        if (lease is null)
        {
            lease = new() { Id = user.Id, UsuarioId = user.Id, DispositivoId = device, Tipo = "dispositivo", Estado = "activo", RegistradoEn = clock.UtcNow };
            db.OfflineRegistros.Add(lease);
        }
        if (lease.Estado == "liberado")
        {
            if (!authorize) throw new ConflictException("El dispositivo fue liberado. Autoriza el teléfono desde Configuración.");
            lease.DispositivoId = device;
            lease.Estado = "activo";
        }
        if (lease.DispositivoId != device) throw new ConflictException("Ya tienes otro dispositivo autorizado. Sincroniza y libera ese dispositivo antes de cambiarlo.");
        return lease;
    }

    public async Task<OfflineSnapshot> Download(Guid device, CancellationToken ct, bool authorize = false)
    {
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, ct);
        await PedidoConcurrency.BloquearAsync(db, user.Id, ct);
        await Device(device, ct, authorize);
        var products = await db.Productos.AsNoTracking().Where(x => x.Activo && x.Eliminado == 0).OrderBy(x => x.Nombre).ToListAsync(ct);
        var prices = JsonSerializer.Serialize(products.OrderBy(x => x.Id).Select(x => new OfflinePrice(x.Id, x.Precio, x.Costo)), Json);
        var catalog = await db.OfflineRegistros.Where(x => x.UsuarioId == user.Id && x.DispositivoId == device && x.Tipo == "catalogo")
            .OrderByDescending(x => x.RegistradoEn).FirstOrDefaultAsync(ct);
        if (catalog is null || catalog.Contenido != prices)
        {
            catalog = new OfflineRecord { Id = Guid.NewGuid(), UsuarioId = user.Id, DispositivoId = device, Tipo = "catalogo", Estado = "emitido", RegistradoEn = clock.UtcNow, Contenido = prices };
            db.OfflineRegistros.Add(catalog);
        }
        var today = DateOnly.FromDateTime(clock.ToLocal(clock.UtcNow).DateTime);
        var start = clock.ToUtc(today);
        var end = clock.ToUtc(today.AddDays(1));
        var source = await db.Pedidos.AsNoTracking().Where(x => x.Eliminado == 0 && x.CanceladoEn == null
            && (user.EsAdministrador || x.CreadoPor == user.Id)
            && ((x.CreadoEn >= start && x.CreadoEn < end) || x.EstadoPago == EstadosPedido.Pendiente
                || db.Pagos.Any(p => p.PedidoId == x.Id && !p.Anulado && p.CreadoEn >= start && p.CreadoEn < end)))
            .Select(x => new { x.Id, x.Numero, x.Referencia, x.NombreCliente, x.CreadoPor, x.CreadoEn, x.Total,
                x.EstadoPreparacion, x.EstadoPago, AtendidoPor = x.Creador.Nombre + " " + x.Creador.Apellido,
                Detalles = x.Detalles.Where(d => d.Eliminado == 0).OrderBy(d => d.Id)
                    .Select(d => new DetallePedidoResponse(d.ProductoId, d.Producto.Nombre, d.Cantidad, d.PrecioUnitario, d.Subtotal)).ToList() }).ToListAsync(ct);
        var ids = source.Select(x => x.Id).ToArray();
        var payments = await db.Pagos.AsNoTracking().Where(x => ids.Contains(x.PedidoId) && !x.Anulado)
            .Select(x => new { x.PedidoId, x.CreadoEn, x.CreadoPor }).ToDictionaryAsync(x => x.PedidoId, ct);
        var orders = new List<OfflineOrder>();
        foreach (var item in source)
        {
            var response = new PedidoResponse(item.Id, item.Numero, item.Referencia, item.NombreCliente, item.NombreCliente ?? item.Referencia,
                item.AtendidoPor, item.EstadoPreparacion, item.EstadoPago, item.Detalles, item.Total, clock.ToLocal(item.CreadoEn), null, null, item.CreadoPor);
            response = response with { Version = PedidoVersion.Calculate(response) };
            payments.TryGetValue(item.Id, out var paid);
            orders.Add(new(response, item.CreadoPor, paid != null ? clock.ToLocal(paid.CreadoEn) : null, paid?.CreadoPor));
        }
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return new(catalog.Id, clock.ToLocal(clock.UtcNow), products.Select(x => new OfflineProduct(x.Id, x.Nombre, x.ImagenUrl, x.Precio)).ToList(), orders);
    }

    public async Task Release(Guid device, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await PedidoConcurrency.BloquearAsync(db, user.Id, ct);
        if (await db.OfflineRegistros.AnyAsync(x => x.Id == user.Id && x.Tipo == "dispositivo" && x.Estado == "liberado" && x.DispositivoId == device, ct)) return;
        var lease = await Device(device, ct);
        if (await db.OfflineRegistros.AnyAsync(x => x.UsuarioId == user.Id && x.Tipo == "operacion" && x.Estado == "conflicto", ct))
            throw new ConflictException("Resuelve las operaciones pendientes de revisión antes de liberar el dispositivo.");
        lease.Estado = "liberado";
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
    }

    public async Task<OfflineResult> Apply(OfflineOperation op, CancellationToken ct)
    {
        if (op.Id == Guid.Empty || op.PedidoId == Guid.Empty || op.Id == user.Id || op.PagoId == Guid.Empty
            || (op.Crear is null && op.PagoId is null && !op.Listo)) throw new BusinessException("La operación está incompleta.");
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await PedidoConcurrency.BloquearAsync(db, user.Id, ct);
        await Device(op.DispositivoId, ct);
        var content = JsonSerializer.Serialize(op, Json);
        var prior = await db.OfflineRegistros.AsNoTracking().SingleOrDefaultAsync(x => x.Id == op.Id, ct);
        if (prior is not null)
        {
            if (prior.UsuarioId != user.Id || prior.Tipo != "operacion" || prior.Contenido != content)
                throw new ConflictException("El identificador ya pertenece a otra operación.");
            return JsonSerializer.Deserialize<OfflineResult>(prior.Resultado, Json)!;
        }
        if (op.PagoId.HasValue) await PedidoConcurrency.BloquearAsync(db, op.PagoId.Value, ct);
        await PedidoConcurrency.BloquearAsync(db, op.PedidoId, ct);
        await db.SaveChangesAsync(ct);
        await tx.CreateSavepointAsync("operacion", ct);
        OfflineResult result;
        try
        {
            if (op.OcurridoEn.UtcDateTime > clock.UtcNow.AddMinutes(5)) throw new BusinessException("La fecha de la operación está en el futuro. Revisa el reloj del dispositivo.");
            var order = await db.Pedidos.Include(x => x.Detalles).SingleOrDefaultAsync(x => x.Id == op.PedidoId, ct);
            if (op.Crear is not null)
            {
                if (order is not null) throw new ConflictException("El pedido ya existe con otra operación.");
                order = await Create(op, ct);
            }
            if (order is null) throw new BusinessException("El pedido todavía no está registrado. Sincroniza primero su creación.");
            if (order.CreadoPor != user.Id) throw new ForbiddenException("Offline solo puedes operar tus propios pedidos.");
            if (order.Eliminado != 0 || order.CanceladoEn != null) throw new ConflictException("El pedido fue cancelado o eliminado. Revisa la operación.");
            if (order.Total != op.TotalEsperado) throw new ConflictException("El importe del pedido cambió. Revisa el efectivo recibido antes de confirmar el cobro.");
            if (op.Crear is null)
            {
                var current = await pedidos.ObtenerAsync(order.Id, ct);
                if (op.Version is null || op.Version != current.Version)
                    throw new ConflictException("Los detalles del pedido cambiaron después de descargarlos. Revisa la operación.");
            }
            if (op.OcurridoEn.UtcDateTime < order.CreadoEn) throw new BusinessException("La operación es anterior al pedido.");
            if (op.PagoId.HasValue)
            {
                var payment = await db.Pagos.SingleOrDefaultAsync(x => x.Id == op.PagoId, ct);
                if (payment is not null || order.EstadoPago == EstadosPedido.Pagado
                    || await db.Pagos.AnyAsync(x => x.PedidoId == order.Id && !x.Anulado, ct))
                    throw new ConflictException("El pedido ya tiene un cobro. Verifica si se recibió efectivo dos veces.");
                db.Pagos.Add(new Pago { Id = op.PagoId.Value, PedidoId = order.Id, Monto = order.Total,
                    CreadoEn = op.OcurridoEn.UtcDateTime, CreadoPor = user.Id });
                order.EstadoPago = EstadosPedido.Pagado;
            }
            if (op.Listo)
            {
                if (!op.ListoEn.HasValue || op.ListoEn.Value.UtcDateTime < order.CreadoEn || op.ListoEn.Value.UtcDateTime > clock.UtcNow.AddMinutes(5))
                    throw new BusinessException("Verifica la fecha de confirmación de cocina.");
                order.EstadoPreparacion = EstadosPedido.Listo;
            }
            order.ActualizadoEn = clock.UtcNow;
            order.ActualizadoPor = user.Id;
            await db.SaveChangesAsync(ct);
            result = new(op.Id, "sincronizado", "Operación sincronizada.", await pedidos.ObtenerAsync(order.Id, ct));
        }
        catch (Exception ex) when (ex is BusinessException or ConflictException or ForbiddenException)
        {
            await tx.RollbackToSavepointAsync("operacion", ct);
            db.ChangeTracker.Clear();
            result = new(op.Id, "conflicto", ex.Message, null);
        }
        db.OfflineRegistros.Add(new() { Id = op.Id, UsuarioId = user.Id, DispositivoId = op.DispositivoId,
            Tipo = "operacion", Estado = result.Estado, Contenido = content, Resultado = JsonSerializer.Serialize(result, Json), RegistradoEn = clock.UtcNow });
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return result;
    }

    private async Task<Pedido> Create(OfflineOperation op, CancellationToken ct)
    {
        var create = op.Crear!;
        var catalog = await db.OfflineRegistros.AsNoTracking().SingleOrDefaultAsync(x => x.Id == create.CatalogoId
            && x.UsuarioId == user.Id && x.DispositivoId == op.DispositivoId && x.Tipo == "catalogo", ct)
            ?? throw new BusinessException("El catálogo no fue autorizado para este usuario y dispositivo.");
        if (op.OcurridoEn.UtcDateTime < catalog.RegistradoEn.AddMinutes(-5)) throw new BusinessException("El pedido es anterior a su catálogo.");
        var prices = JsonSerializer.Deserialize<List<OfflinePrice>>(catalog.Contenido, Json)!.ToDictionary(x => x.Id);
        if (string.IsNullOrWhiteSpace(create.Referencia) || create.Detalles.Count is < 1 or > 100
            || create.Detalles.Select(x => x.ProductoId).Distinct().Count() != create.Detalles.Count)
            throw new BusinessException("Verifica la referencia y los detalles del pedido.");
        var order = new Pedido { Id = op.PedidoId, Referencia = create.Referencia.Trim(), NombreCliente = string.IsNullOrWhiteSpace(create.NombreCliente) ? null : create.NombreCliente.Trim(),
            CreadoEn = op.OcurridoEn.UtcDateTime, CreadoPor = user.Id };
        foreach (var line in create.Detalles)
        {
            if (line.Cantidad <= 0 || !prices.TryGetValue(line.ProductoId, out var price) || price.Precio != line.PrecioUnitario)
                throw new BusinessException("Los precios no coinciden con el catálogo autorizado.");
            var subtotal = price.Precio * line.Cantidad;
            if (subtotal > 9999999999.99m) throw new BusinessException("El importe supera el máximo permitido.");
            order.Detalles.Add(new() { ProductoId = price.Id, Cantidad = line.Cantidad, PrecioUnitario = price.Precio, CostoUnitario = price.Costo, Subtotal = subtotal });
        }
        order.Total = order.Detalles.Sum(x => x.Subtotal);
        if (order.Total > 9999999999.99m) throw new BusinessException("El total supera el máximo permitido.");
        db.Pedidos.Add(order);
        return order;
    }

    public async Task<IReadOnlyList<OfflineRecord>> Conflicts(CancellationToken ct)
    {
        return await db.OfflineRegistros.AsNoTracking().Where(x => x.Tipo == "operacion" && x.Estado == "conflicto"
            && (user.EsAdministrador || x.UsuarioId == user.Id)).OrderBy(x => x.RegistradoEn).ToListAsync(ct);
    }

    public async Task<IReadOnlyList<OfflineResult>> States(CancellationToken ct)
    {
        var records = await db.OfflineRegistros.AsNoTracking().Where(x => x.UsuarioId == user.Id && x.Tipo == "operacion"
            && (x.Estado == "conflicto" || x.Estado == "revisado")).Select(x => x.Resultado).ToListAsync(ct);
        return records.Select(x => JsonSerializer.Deserialize<OfflineResult>(x, Json)!).ToList();
    }

    public async Task Resolve(Guid id, string reason, CancellationToken ct)
    {
        if (!user.EsAdministrador) throw new ForbiddenException("Solo administración puede resolver conflictos.");
        if (string.IsNullOrWhiteSpace(reason)) throw new BusinessException("Escribe el motivo de la resolución.");
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await PedidoConcurrency.BloquearAsync(db, id, ct);
        var record = await db.OfflineRegistros.SingleOrDefaultAsync(x => x.Id == id && x.Estado == "conflicto", ct)
            ?? throw new NotFoundException("El conflicto no está pendiente.");
        record.Estado = "revisado";
        var operation = JsonSerializer.Deserialize<OfflineOperation>(record.Contenido, Json)!;
        var originalResult = record.Resultado;
        record.Resultado = JsonSerializer.Serialize(new OfflineResult(id, "revisado", reason, null), Json);
        db.OfflineRegistros.Add(new() { Id = Guid.NewGuid(), UsuarioId = user.Id, DispositivoId = record.DispositivoId,
            Tipo = "revision", Estado = "revisado", RegistradoEn = clock.UtcNow,
            Contenido = JsonSerializer.Serialize(new { operacionId = id, operation.PedidoId, motivo = reason, resultadoAnterior = originalResult }, Json) });
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
    }
}
