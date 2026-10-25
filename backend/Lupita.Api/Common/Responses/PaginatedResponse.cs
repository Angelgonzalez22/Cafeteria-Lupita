using Lupita.Api.Common.Pagination;
namespace Lupita.Api.Common.Responses;
public sealed record PaginatedResponse<T>(int Status, string Titulo, string Mensaje, IReadOnlyList<T> Data, PaginationMetadata Pagination);
