namespace Lupita.Api.Common.Exceptions;
public sealed class BusinessException(string message) : AppException(message, 400, "Operación inválida");
