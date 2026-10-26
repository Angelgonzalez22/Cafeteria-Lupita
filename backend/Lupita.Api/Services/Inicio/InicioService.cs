/* RESUMEN DEL INICIO POR ROL */

using System.Data;
using Lupita.Api.Authentication;
using Lupita.Api.Common.Exceptions;
using Lupita.Api.Common.Time;
using Lupita.Api.Data;
using Lupita.Api.DTOs.Inicio;
using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lupita.Api.Services.Inicio;

public sealed class InicioService(CafeteriaDbContext db, IAppClock clock, IUsuarioActual usuario) : IInicioService
{
    public async Task<InicioResumenResponse> ResumenAsync(string rol, CancellationToken cancellationToken)
    {
        if (rol is not (RolesSistema.Administrador or RolesSistema.Cajero or RolesSistema.Cocina))
            throw new ForbiddenException("Tu rol no tiene acceso al resumen de inicio.");

        var fecha = DateOnly.FromDateTime(clock.ToLocal(clock.UtcNow).DateTime);
        var inicio = clock.ToUtc(fecha);
        var fin = clock.ToUtc(fecha.AddDays(1));
        var desde = clock.ToLocal(inicio);
        var hasta = clock.ToLocal(fin.AddTicks(-1));
        var pedidos = db.Pedidos.AsNoTracking()
            .Where(x => x.Eliminado == 0 && x.CanceladoEn == null);

        if (rol == RolesSistema.Cocina)
        {
            var cocina = await pedidos.GroupBy(x => 1).Select(g => new
            {
                Recibidos = g.Count(x => x.CreadoEn >= inicio && x.CreadoEn < fin),
                Pendientes = g.Count(x => x.EstadoPreparacion == EstadosPedido.Pendiente),
                Preparando = g.Count(x => x.EstadoPreparacion == EstadosPedido.Preparando)
            }).SingleOrDefaultAsync(cancellationToken);

            return new(rol, fecha, desde, hasta, cocina?.Recibidos ?? 0,
                null, null, null, cocina?.Pendientes ?? 0, cocina?.Preparando ?? 0);
        }

        await using var transaction = await db.Database.BeginTransactionAsync(
            IsolationLevel.RepeatableRead, cancellationToken);

        var delDia = pedidos.Where(x => x.CreadoEn >= inicio && x.CreadoEn < fin);
        var pagos = db.Pagos.AsNoTracking().Where(x =>
            !x.Anulado && x.CreadoEn >= inicio && x.CreadoEn < fin &&
            x.Pedido.Eliminado == 0 && x.Pedido.CanceladoEn == null &&
            x.Pedido.EstadoPago == EstadosPedido.Pagado);

        if (rol == RolesSistema.Cajero)
        {
            var empleadoId = usuario.Id;
            delDia = delDia.Where(x => x.CreadoPor == empleadoId);
            pagos = pagos.Where(x => x.CreadoPor == empleadoId);
        }

        var conteos = await delDia.GroupBy(x => 1).Select(g => new
        {
            Realizados = g.Count(),
            Pendientes = g.Count(x => x.EstadoPago == EstadosPedido.Pendiente)
        }).SingleOrDefaultAsync(cancellationToken);

        var cobros = await pagos.GroupBy(x => 1).Select(g => new
        {
            Total = g.Sum(x => x.Monto),
            Pagados = g.Select(x => x.PedidoId).Distinct().Count()
        }).SingleOrDefaultAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return new(rol, fecha, desde, hasta, conteos?.Realizados ?? 0,
            cobros?.Total ?? 0m, cobros?.Pagados ?? 0, conteos?.Pendientes ?? 0, null, null);
    }
}
