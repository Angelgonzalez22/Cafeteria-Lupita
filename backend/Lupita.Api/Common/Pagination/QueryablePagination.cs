using Lupita.Api.Common.Responses;
using Microsoft.EntityFrameworkCore;

namespace Lupita.Api.Common.Pagination;

public static class QueryablePagination
{
    public static async Task<PaginatedResponse<T>> PaginateAsync<T>(
        this IQueryable<T> query, PaginationQuery pagination, string mensaje, CancellationToken cancellationToken)
    {
        if (pagination.Page < 1 || pagination.PageSize is < 1 or > 100)
            throw new Lupita.Api.Common.Exceptions.ValidationException("La página y el tamaño de página no son válidos.");
        var count = await query.CountAsync(cancellationToken);
        var offset = ((long)pagination.Page - 1) * pagination.PageSize;
        var data = offset > int.MaxValue ? [] : await query.Skip((int)offset).Take(pagination.PageSize).ToListAsync(cancellationToken);
        return new(200, "Consulta exitosa", mensaje, data, PaginationMetadata.Create(pagination.Page, pagination.PageSize, count));
    }
}
