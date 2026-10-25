namespace Lupita.Api.Common.Exceptions;
public sealed class ForbiddenException(string message) : AppException(message, 403, "Acceso denegado");
