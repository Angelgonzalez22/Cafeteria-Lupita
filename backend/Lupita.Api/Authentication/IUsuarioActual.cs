namespace Lupita.Api.Authentication;

public interface IUsuarioActual
{
    Guid Id { get; }
    bool EsAdministrador { get; }
}
