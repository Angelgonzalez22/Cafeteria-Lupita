namespace Lupita.Api.Common.Responses;
public record ApiResponse<T>(int Status, string Titulo, string Mensaje, T? Data)
{
    public static ApiResponse<T> Success(T data, string titulo, string mensaje, int status = 200) => new(status, titulo, mensaje, data);
}
