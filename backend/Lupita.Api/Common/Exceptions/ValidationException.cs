namespace Lupita.Api.Common.Exceptions;
public sealed class ValidationException(string message) : AppException(message, 400, "Solicitud inválida");
