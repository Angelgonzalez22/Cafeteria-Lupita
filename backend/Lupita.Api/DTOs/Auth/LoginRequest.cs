using System.ComponentModel.DataAnnotations;
namespace Lupita.Api.DTOs.Auth;
public sealed class LoginRequest
{
    [Required, StringLength(25)] public string Cedula { get; init; } = "";
    [Required, StringLength(1024)] public string Contrasena { get; init; } = "";
}
