using System.Data;
using System.Globalization;
using Lupita.Api.Authentication;
using Lupita.Api.Common.Exceptions;
using Lupita.Api.Common.Time;
using Lupita.Api.Data;
using Lupita.Api.DTOs.Reportes;
using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Lupita.Api.Services.Reportes;

public sealed class ReporteService(CafeteriaDbContext db, IAppClock clock, IUsuarioActual usuario,
    IOptions<TimeZoneOptions> timeZone) : IReporteService
{
    //SERVICIO PARA TRAER EL REPORTE DE VENTAS COBRADAS
    public async Task<VentasReporteResponse> VentasAsync(ReporteQuery query, CancellationToken cancellationToken)
    {
        var rango = ResolverRango(query);
        var filas = await CargarSerieAsync(rango, cancellationToken);
        return new(rango.Desde, rango.Hasta, rango.Agrupacion, filas.Sum(x => x.Ingresos),
            filas.Sum(x => x.Cobros), filas.Sum(x => x.Cobros),
            CompletarSerie(rango, filas).Select(x => new VentaPuntoResponse(x.Fecha, x.Ingresos)).ToList());
    }

    //SERVICIO PARA TRAER COSTOS Y UTILIDAD BRUTA ESTIMADA
    public async Task<UtilidadReporteResponse> UtilidadAsync(ReporteQuery query, CancellationToken cancellationToken)
    {
        var rango = ResolverRango(query);
        var filas = await CargarSerieAsync(rango, cancellationToken);
        var ingresos = filas.Sum(x => x.Ingresos);
        var costos = filas.Sum(x => x.Costos);
        return new(rango.Desde, rango.Hasta, rango.Agrupacion, ingresos, costos, ingresos - costos,
            ingresos == 0 ? 0 : decimal.Round((ingresos - costos) / ingresos * 100m, 2, MidpointRounding.AwayFromZero),
            CompletarSerie(rango, filas).Select(x => new UtilidadPuntoResponse(x.Fecha, x.Ingresos, x.Costos, x.Ingresos - x.Costos)).ToList());
    }

    //SERVICIO PARA TRAER LOS PRODUCTOS MAS VENDIDOS
    public async Task<ProductosVendidosResponse> ProductosMasVendidosAsync(ProductosVendidosQuery query, CancellationToken cancellationToken)
    {
        var rango = ResolverRango(query);
        var ranking =
            from pago in PagosValidos(rango)
            join detalle in db.DetallesPedido.AsNoTracking().Where(x => x.Eliminado == 0)
                on pago.PedidoId equals detalle.PedidoId
            group detalle by new { detalle.ProductoId, detalle.Producto.Nombre } into grupo
            select new
            {
                grupo.Key.ProductoId, grupo.Key.Nombre,
                CantidadVendida = grupo.Sum(x => (long)x.Cantidad),
                TotalVentas = grupo.Sum(x => x.Subtotal),
                CostoEstimado = grupo.Sum(x => x.Cantidad * x.CostoUnitario)
            };
        var productos = await ranking
            .OrderByDescending(x => x.CantidadVendida).ThenByDescending(x => x.TotalVentas).ThenBy(x => x.ProductoId)
            .Take(query.Top)
            .Select(x => new ProductoVendidoResponse(x.ProductoId, x.Nombre, x.CantidadVendida,
                x.TotalVentas, x.CostoEstimado, x.TotalVentas - x.CostoEstimado))
            .ToListAsync(cancellationToken);
        return new(rango.Desde, rango.Hasta, productos);
    }

    //SERVICIO PARA TRAER EL RESUMEN DEL ADMINISTRADOR
    public async Task<ResumenReporteResponse> ResumenAsync(ReporteQuery query, CancellationToken cancellationToken)
    {
        var rango = ResolverRango(query);
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, cancellationToken);
        var filas = await CargarSerieAsync(rango, cancellationToken);
        var pedidos = await ContarPedidosAsync(rango, null, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new(rango.Desde, rango.Hasta, filas.Sum(x => x.Ingresos), pedidos.Creados,
            pedidos.Pendientes, pedidos.Pagados, pedidos.Cancelados, filas.Sum(x => x.Ingresos - x.Costos));
    }

    //SERVICIO PARA TRAER LOS COBROS Y PEDIDOS DEL EMPLEADO AUTENTICADO
    public async Task<MisVentasResponse> MisVentasAsync(ReporteQuery query, CancellationToken cancellationToken)
    {
        var rango = ResolverRango(query);
        var empleadoId = usuario.Id;
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, cancellationToken);
        var cobros = await PagosValidos(rango).Where(x => x.CreadoPor == empleadoId)
            .GroupBy(x => 1).Select(g => new { Total = g.Sum(x => x.Monto), Cantidad = g.Count() })
            .SingleOrDefaultAsync(cancellationToken);
        var pedidos = await ContarPedidosAsync(rango, empleadoId, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new(rango.Desde, rango.Hasta, cobros?.Total ?? 0m, cobros?.Cantidad ?? 0, pedidos.Creados, pedidos.Pendientes);
    }

    //SERVICIO PARA TRAER LOS CONTADORES OPERATIVOS DE COCINA
    public async Task<CocinaReporteResponse> CocinaAsync(ReporteQuery query, CancellationToken cancellationToken)
    {
        var rango = ResolverRango(query);
        var conteos = await db.Pedidos.AsNoTracking()
            .Where(x => x.CreadoEn >= rango.InicioUtc && x.CreadoEn < rango.FinUtc && x.Eliminado == 0 && x.CanceladoEn == null)
            .GroupBy(x => x.EstadoPreparacion).Select(g => new { Estado = g.Key, Cantidad = g.Count() })
            .ToDictionaryAsync(x => x.Estado, x => x.Cantidad, cancellationToken);
        return new(rango.Desde, rango.Hasta, conteos.GetValueOrDefault(EstadosPedido.Pendiente),
            conteos.GetValueOrDefault(EstadosPedido.Preparando), conteos.GetValueOrDefault(EstadosPedido.Listo));
    }

    private IQueryable<Pago> PagosValidos(Rango rango) => db.Pagos.AsNoTracking().Where(x =>
        !x.Anulado && x.CreadoEn >= rango.InicioUtc && x.CreadoEn < rango.FinUtc &&
        x.Pedido.Eliminado == 0 && x.Pedido.CanceladoEn == null && x.Pedido.EstadoPago == EstadosPedido.Pagado);

    private Task<List<FilaAgregada>> CargarSerieAsync(Rango rango, CancellationToken cancellationToken)
    {
        var zona = timeZone.Value.Id;
        var porMes = rango.Agrupacion == "MES";
        var porHora = rango.Agrupacion == "HORA";
        return PagosValidos(rango).Select(x => new
            {
                Fecha = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(x.CreadoEn, zona),
                x.Monto,
                Costo = x.Pedido.Detalles.Where(d => d.Eliminado == 0).Sum(d => (decimal?)(d.Cantidad * d.CostoUnitario)) ?? 0m
            })
            .GroupBy(x => new { x.Fecha.Year, x.Fecha.Month, Dia = porMes ? 1 : x.Fecha.Day, Hora = porHora ? x.Fecha.Hour : 0 })
            .Select(g => new FilaAgregada(g.Key.Year, g.Key.Month, g.Key.Dia, g.Key.Hora,
                g.Count(), g.Sum(x => x.Monto), g.Sum(x => x.Costo)))
            .ToListAsync(cancellationToken);
    }

    private async Task<ConteoPedidos> ContarPedidosAsync(Rango rango, Guid? empleadoId, CancellationToken cancellationToken)
    {
        var pedidos = db.Pedidos.AsNoTracking().Where(x => x.CreadoEn >= rango.InicioUtc && x.CreadoEn < rango.FinUtc && x.Eliminado == 0);
        if (empleadoId.HasValue) pedidos = pedidos.Where(x => x.CreadoPor == empleadoId.Value);
        return await pedidos.GroupBy(x => 1).Select(g => new ConteoPedidos(g.Count(),
            g.Count(x => x.CanceladoEn == null && x.EstadoPago == EstadosPedido.Pendiente),
            g.Count(x => x.CanceladoEn == null && x.EstadoPago == EstadosPedido.Pagado),
            g.Count(x => x.CanceladoEn != null))).SingleOrDefaultAsync(cancellationToken) ?? new(0, 0, 0, 0);
    }

    private Rango ResolverRango(ReporteQuery query)
    {
        var hoy = DateOnly.FromDateTime(clock.ToLocal(clock.UtcNow).DateTime);
        var desde = query.Desde ?? query.Hasta ?? hoy;
        var hasta = query.Hasta ?? query.Desde ?? hoy;
        if (desde > hasta || hasta == DateOnly.MaxValue)
            throw new BusinessException("El rango desde/hasta no es válido.");
        var dias = hasta.DayNumber - desde.DayNumber + 1;
        if (dias > 3660) throw new BusinessException("El rango no puede superar diez años.");
        return new(desde, hasta, clock.ToUtc(desde), clock.ToUtc(hasta.AddDays(1)),
            dias == 1 ? "HORA" : dias <= 92 ? "DIA" : "MES");
    }

    private static IEnumerable<Punto> CompletarSerie(Rango rango, IReadOnlyList<FilaAgregada> filas)
    {
        var datos = filas.ToDictionary(x => new DateTime(x.Anio, x.Mes, x.Dia, x.Hora, 0, 0, DateTimeKind.Unspecified));
        var inicio = rango.Desde.ToDateTime(TimeOnly.MinValue);
        if (rango.Agrupacion == "MES") inicio = new DateTime(inicio.Year, inicio.Month, 1);
        var fin = rango.Hasta.AddDays(1).ToDateTime(TimeOnly.MinValue);
        for (var cursor = inicio; cursor < fin; cursor = rango.Agrupacion switch
            { "HORA" => cursor.AddHours(1), "MES" => cursor.AddMonths(1), _ => cursor.AddDays(1) })
        {
            datos.TryGetValue(cursor, out var fila);
            var formato = rango.Agrupacion switch { "HORA" => "yyyy-MM-dd'T'HH':00'", "MES" => "yyyy-MM", _ => "yyyy-MM-dd" };
            yield return new(cursor.ToString(formato, CultureInfo.InvariantCulture), fila?.Ingresos ?? 0m, fila?.Costos ?? 0m);
        }
    }

    private sealed record Rango(DateOnly Desde, DateOnly Hasta, DateTime InicioUtc, DateTime FinUtc, string Agrupacion);
    private sealed record FilaAgregada(int Anio, int Mes, int Dia, int Hora, int Cobros, decimal Ingresos, decimal Costos);
    private sealed record Punto(string Fecha, decimal Ingresos, decimal Costos);
    private sealed record ConteoPedidos(int Creados, int Pendientes, int Pagados, int Cancelados);
}
