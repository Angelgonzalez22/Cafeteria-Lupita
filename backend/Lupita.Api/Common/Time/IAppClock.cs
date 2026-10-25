namespace Lupita.Api.Common.Time;
public interface IAppClock
{
    DateTime UtcNow { get; }
    DateTimeOffset ToLocal(DateTime utc);
    DateTime ToUtc(DateOnly localDate);
}
