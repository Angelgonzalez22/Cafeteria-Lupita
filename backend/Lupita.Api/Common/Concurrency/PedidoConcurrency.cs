using Lupita.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Lupita.Api.Common.Concurrency;

public static class PedidoConcurrency
{
    public static async Task BloquearAsync(CafeteriaDbContext db, Guid id, CancellationToken cancellationToken)
    {
        await db.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT pg_advisory_xact_lock(hashtextextended({id.ToString()}, 0))", cancellationToken);
        await db.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT 1 FROM pedidos WHERE id = {id} FOR UPDATE", cancellationToken);
    }
}
