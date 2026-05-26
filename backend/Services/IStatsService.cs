using KitmaiOx.API.DTOs;

namespace KitmaiOx.API.Services;

public interface IStatsService
{
    Task<StatsDto> GetAsync(int userId, CancellationToken cancellationToken);
}
