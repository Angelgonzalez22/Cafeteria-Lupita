using System.ComponentModel.DataAnnotations;
namespace Lupita.Api.Authentication;
public sealed class JwtOptions
{
    [Required] public string Issuer { get; init; } = "";
    [Required] public string Audience { get; init; } = "";
    [Required] public string Key { get; init; } = "";
    [Range(1, 1440)] public int ExpirationMinutes { get; init; } = 60;
}
