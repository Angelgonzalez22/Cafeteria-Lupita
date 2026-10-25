using System.Text;
using Lupita.Api.Authentication;
using Lupita.Api.Common.Middleware;
using Lupita.Api.Common.Responses;
using Lupita.Api.Common.Time;
using Lupita.Api.Data;
using Lupita.Api.Data.Seed;
using Lupita.Api.Models;
using Lupita.Api.Services.Auth;
using Lupita.Api.Services.Productos;
using Lupita.Api.Services.Pedidos;
using Lupita.Api.Services.Cocina;
using Lupita.Api.Services.Pagos;
using Lupita.Api.Services.Reportes;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers().ConfigureApiBehaviorOptions(options =>
{
    options.SuppressMapClientErrors = true;
    options.InvalidModelStateResponseFactory = context => new BadRequestObjectResult(
        new ApiResponse<object>(400, "Solicitud inválida", "Verifica los campos enviados y sus longitudes.", null));
});
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.Configure<TimeZoneOptions>(builder.Configuration.GetSection("TimeZone"));
builder.Services.AddSingleton<IAppClock, AppClock>();
builder.Services.AddOptions<JwtOptions>().BindConfiguration("Jwt").ValidateDataAnnotations()
    .Validate(o => Encoding.UTF8.GetByteCount(o.Key) >= 32, "Configura Jwt:Key con al menos 32 bytes mediante variables de entorno o User Secrets.").ValidateOnStart();
builder.Services.AddDbContext<CafeteriaDbContext>(options => options.UseNpgsql(
    builder.Configuration.GetConnectionString("Postgres") ?? throw new InvalidOperationException("Configura ConnectionStrings:Postgres.")));
builder.Services.AddScoped<IPasswordHasher<Usuario>, PasswordHasher<Usuario>>();
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<DevelopmentSeeder>();
builder.Services.AddScoped<DevelopmentProductSeeder>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUsuarioActual, UsuarioActual>();
builder.Services.AddScoped<IProductoService, ProductoService>();
builder.Services.AddScoped<IPedidoService, PedidoService>();
builder.Services.AddScoped<ICocinaService, CocinaService>();
builder.Services.AddScoped<IPagoService, PagoService>();
builder.Services.AddScoped<IReporteService, ReporteService>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IOptions<JwtOptions>>((options, settings) =>
    {
        var jwt = settings.Value;
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, ValidIssuer = jwt.Issuer,
            ValidateAudience = true, ValidAudience = jwt.Audience,
            ValidateIssuerSigningKey = true, IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            ValidateLifetime = true, RequireExpirationTime = true, RequireSignedTokens = true,
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256], ClockSkew = TimeSpan.Zero,
            NameClaimType = "sub", RoleClaimType = "role"
        };
        options.IncludeErrorDetails = false;
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                if (!Guid.TryParse(context.Principal?.FindFirst("sub")?.Value, out var id)) { context.Fail("Sesión inválida."); return; }
                var db = context.HttpContext.RequestServices.GetRequiredService<CafeteriaDbContext>();
                var role = await db.Usuarios.AsNoTracking().Where(x => x.Id == id && x.Activo && x.Eliminado == 0)
                    .Select(x => x.Rol.Nombre).SingleOrDefaultAsync(context.HttpContext.RequestAborted);
                if (role is null || role != context.Principal?.FindFirst("role")?.Value) context.Fail("Sesión inválida.");
            },
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = 401;
                context.Response.Headers.WWWAuthenticate = "Bearer";
                await context.Response.WriteAsJsonAsync(new ApiResponse<object>(401, "Acceso no autorizado", "Se requiere una sesión válida.", null), context.HttpContext.RequestAborted);
            },
            OnForbidden = context =>
            {
                context.Response.StatusCode = 403;
                return context.Response.WriteAsJsonAsync(new ApiResponse<object>(403, "Acceso denegado", "No tienes permisos para realizar esta operación.", null), context.HttpContext.RequestAborted);
            }
        };
    });
builder.Services.AddAuthorization(PoliticasAcceso.Configure);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Cafetería Lupita", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme { Type = SecuritySchemeType.Http, Scheme = "bearer", BearerFormat = "JWT" });
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});
var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages(async context =>
{
    var response = context.HttpContext.Response;
    await response.WriteAsJsonAsync(new ApiResponse<object>(response.StatusCode, "Solicitud no procesada", "No se pudo procesar la solicitud.", null), context.HttpContext.RequestAborted);
});
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
if (app.Environment.IsDevelopment() && app.Configuration.GetValue<bool>("Seed:Enabled"))
{
    await using var scope = app.Services.CreateAsyncScope();
    await scope.ServiceProvider.GetRequiredService<DevelopmentSeeder>().SeedAsync(app.Lifetime.ApplicationStopping);
    await scope.ServiceProvider.GetRequiredService<DevelopmentProductSeeder>().SeedAsync(app.Lifetime.ApplicationStopping);
}
app.Run();
