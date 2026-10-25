namespace Lupita.Api.Common.Exceptions;
public abstract class AppException(string message, int status, string title) : Exception(message)
{
    public int Status { get; } = status;
    public string Title { get; } = title;
}
