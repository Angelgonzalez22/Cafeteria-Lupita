namespace Lupita.Api.Common.Exceptions;
public sealed class NotFoundException(string message) : AppException(message, 404, "Recurso no encontrado");
