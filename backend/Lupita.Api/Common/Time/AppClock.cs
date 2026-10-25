using Microsoft.Extensions.Options;
namespace Lupita.Api.Common.Time;
public sealed class AppClock(IOptions<TimeZoneOptions> options) : IAppClock
{
    private readonly TimeZoneInfo zone = TimeZoneInfo.FindSystemTimeZoneById(options.Value.Id);
    public DateTime UtcNow => DateTime.UtcNow;
    public DateTime ToUtc(DateOnly localDate) =>
        TimeZoneInfo.ConvertTimeToUtc(localDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified), zone);
    public DateTimeOffset ToLocal(DateTime utc)
    {
        if (utc.Kind != DateTimeKind.Utc) throw new ArgumentException("Se requiere una fecha UTC.", nameof(utc));
        return TimeZoneInfo.ConvertTime(new DateTimeOffset(utc), zone);
    }
}
