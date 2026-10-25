namespace Lupita.Api.Common.Exceptions;
public sealed class UnauthorizedException(string message) : AppException(message, 401, "Acceso no autorizado");
