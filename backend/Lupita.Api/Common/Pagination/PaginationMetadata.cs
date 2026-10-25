namespace Lupita.Api.Common.Pagination;
public sealed record PaginationMetadata(int CurrentPage, int PageSize, int TotalItems, int TotalPages, bool HasNextPage, bool HasPreviousPage)
{
    public static PaginationMetadata Create(int page, int pageSize, int totalItems)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(page, 1);
        ArgumentOutOfRangeException.ThrowIfLessThan(pageSize, 1);
        ArgumentOutOfRangeException.ThrowIfNegative(totalItems);
        var pages = (int)Math.Ceiling(totalItems / (double)pageSize);
        return new(page, pageSize, totalItems, pages, page < pages, page > 1);
    }
}
