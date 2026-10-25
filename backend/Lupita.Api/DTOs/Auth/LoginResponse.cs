namespace Lupita.Api.DTOs.Auth;
public sealed record LoginResponse(string Token, DateTime ExpiraEn, UsuarioResponse Usuario);
