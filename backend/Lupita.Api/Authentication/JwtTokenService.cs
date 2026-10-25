using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Lupita.Api.Common.Time;
using Lupita.Api.DTOs.Auth;
using Lupita.Api.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
namespace Lupita.Api.Authentication;
public sealed class JwtTokenService(IOptions<JwtOptions> options, IAppClock clock)
{
    public LoginResponse Create(Usuario user)
    {
        var settings = options.Value;
        var now = clock.UtcNow;
        var expires = now.AddMinutes(settings.ExpirationMinutes);
        var token = new JwtSecurityToken(settings.Issuer, settings.Audience,
            [new Claim("sub", user.Id.ToString()), new Claim("role", user.Rol.Nombre),
             new Claim("jti", Guid.NewGuid().ToString()), new Claim("iat", new DateTimeOffset(now).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)],
            now, expires, new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Key)), SecurityAlgorithms.HmacSha256));
        return new(new JwtSecurityTokenHandler().WriteToken(token), expires, new(user.Id, user.Nombre, user.Apellido, user.Rol.Nombre));
    }
}
