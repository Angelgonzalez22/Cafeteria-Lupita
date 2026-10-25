namespace Lupita.Api.Common.Exceptions;
public sealed class ConflictException(string message) : AppException(message, 409, "Conflicto");
