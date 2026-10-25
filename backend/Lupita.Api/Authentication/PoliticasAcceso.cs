namespace Lupita.Api.Authentication;
public static class PoliticasAcceso
{
    public const string GestionarVentas = nameof(GestionarVentas);
    public const string CobrarPedidos = nameof(CobrarPedidos);
    public const string PrepararPedidos = nameof(PrepararPedidos);
    public const string GestionarProductos = nameof(GestionarProductos);
    public const string VerReportes = nameof(VerReportes);
    public const string AdministrarUsuarios = nameof(AdministrarUsuarios);
    public const string AnularPagos = nameof(AnularPagos);
    public static void Configure(Microsoft.AspNetCore.Authorization.AuthorizationOptions options)
    {
        foreach (var policy in new[] { GestionarVentas, CobrarPedidos })
            options.AddPolicy(policy, p => p.RequireAuthenticatedUser().RequireRole(RolesSistema.Administrador, RolesSistema.Cajero));
        options.AddPolicy(PrepararPedidos, p => p.RequireAuthenticatedUser().RequireRole(RolesSistema.Cocina));
        foreach (var policy in new[] { GestionarProductos, VerReportes, AdministrarUsuarios, AnularPagos })
            options.AddPolicy(policy, p => p.RequireAuthenticatedUser().RequireRole(RolesSistema.Administrador));
    }
}
