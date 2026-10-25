using Lupita.Api.Authentication;
using Lupita.Api.Common.Concurrency;
using Lupita.Api.Common.Exceptions;
using Lupita.Api.Common.Pagination;
using Lupita.Api.Common.Responses;
using Lupita.Api.Common.Time;
using Lupita.Api.Data;
using Lupita.Api.DTOs.Cocina;
using Lupita.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lupita.Api.Services.Cocina;

public sealed class CocinaService(CafeteriaDbContext db, IUsuarioActual usuario, IAppClock clock) : ICocinaService
{
    //SERVICIO PARA TRAER LOS PEDIDOS DE COCINA CON FILTROS
    public async Task<PaginatedResponse<CocinaListadoResponse>> ListarAsync(CocinaQuery query, CancellationToken cancellationToken)
    {
        var pedidos = db.Pedidos.AsNoTracking();
        if (query.SoloActivos)
            pedidos = pedidos.Where(x => x.Eliminado == 0 && x.CanceladoEn == null && x.EstadoPreparacion != EstadosPedido.Listo);
        if (query.Cancelados.HasValue) pedidos = pedidos.Where(x => (x.CanceladoEn != null) == query.Cancelados.Value);
        if (query.Eliminados.HasValue) pedidos = pedidos.Where(x => (x.Eliminado != 0) == query.Eliminados.Value);
        if (query.EstadoPreparacion is not null) pedidos = pedidos.Where(x => x.EstadoPreparacion == query.EstadoPreparacion);
        if (query.Desde.HasValue)
        {
            var desde = query.Desde.Value.UtcDateTime;
            pedidos = pedidos.Where(x => x.CreadoEn >= desde);
        }
        if (query.Hasta.HasValue)
        {
            var hasta = query.Hasta.Value.UtcDateTime;
            pedidos = pedidos.Where(x => x.CreadoEn <= hasta);
        }
        var page = await pedidos.OrderBy(x => x.Numero)
            .Select(x => new ListadoData(x.Id, x.Numero, x.NombreCliente ?? x.Referencia,
                x.EstadoPreparacion, x.CreadoEn, x.CanceladoEn != null, x.Eliminado != 0))
            .PaginateAsync(query, "Pedidos de cocina obtenidos correctamente.", cancellationToken);
        return new(page.Status, page.Titulo, page.Mensaje,
            page.Data.Select(x => new CocinaListadoResponse(x.Id, x.Numero, x.Cliente, x.EstadoPreparacion,
                clock.ToLocal(x.CreadoEn), x.Cancelado, x.Eliminado)).ToList(), page.Pagination);
    }

    //SERVICIO PARA TRAER EL DETALLE OPERATIVO DE COCINA
    public async Task<CocinaPedidoResponse> ObtenerAsync(Guid id, CancellationToken cancellationToken)
    {
        var pedido = await db.Pedidos.AsNoTracking().Where(x => x.Id == id)
            .Select(x => new DetalleData(x.Id, x.Numero, x.NombreCliente ?? x.Referencia,
                x.Creador.Nombre + " " + x.Creador.Apellido, x.EstadoPreparacion, x.CreadoEn,
                x.CanceladoEn != null, x.Eliminado != 0, x.Detalles.Where(d => d.Eliminado == 0)
                    .OrderBy(d => d.Id).Select(d => new CocinaProductoResponse(d.ProductoId, d.Producto.Nombre, d.Cantidad)).ToList()))
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("El pedido no existe.");
        return new(pedido.Id, pedido.Numero, pedido.Cliente, pedido.AtendidoPor, pedido.EstadoPreparacion,
            clock.ToLocal(pedido.CreadoEn), pedido.Cancelado, pedido.Eliminado, pedido.Detalles);
    }

    //SERVICIO PARA INICIAR LA PREPARACION DEL PEDIDO
    public Task<CocinaPedidoResponse> IniciarAsync(Guid id, CancellationToken cancellationToken)
        => CambiarEstadoAsync(id, EstadosPedido.Pendiente, EstadosPedido.Preparando, cancellationToken);

    //SERVICIO PARA FINALIZAR LA PREPARACION DEL PEDIDO
    public Task<CocinaPedidoResponse> FinalizarAsync(Guid id, CancellationToken cancellationToken)
        => CambiarEstadoAsync(id, EstadosPedido.Preparando, EstadosPedido.Listo, cancellationToken);

    private async Task<CocinaPedidoResponse> CambiarEstadoAsync(Guid id, string origen, string destino, CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        await PedidoConcurrency.BloquearAsync(db, id, cancellationToken);
        var pedido = await db.Pedidos.SingleOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("El pedido no existe.");
        if (pedido.Eliminado != 0 || pedido.CanceladoEn is not null)
            throw new BusinessException("No se puede preparar un pedido cancelado o eliminado.");
        if (pedido.EstadoPreparacion != origen)
            throw new ConflictException("La transición no es válida para el estado actual del pedido.");
        pedido.EstadoPreparacion = destino;
        pedido.ActualizadoEn = clock.UtcNow;
        pedido.ActualizadoPor = usuario.Id;
        await db.SaveChangesAsync(cancellationToken);
        var result = await ObtenerAsync(id, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return result;
    }

    private sealed record ListadoData(Guid Id, long Numero, string Cliente, string EstadoPreparacion, DateTime CreadoEn,
        bool Cancelado, bool Eliminado);
    private sealed record DetalleData(Guid Id, long Numero, string Cliente, string AtendidoPor, string EstadoPreparacion,
        DateTime CreadoEn, bool Cancelado, bool Eliminado, List<CocinaProductoResponse> Detalles);
}
