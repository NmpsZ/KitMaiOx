using KitmaiOx.API.Models;

namespace KitmaiOx.API.Repositories;

public interface IHistoryRepository
{
    Task<SearchHistory> AddAsync(SearchHistory history, CancellationToken cancellationToken);
    Task<List<SearchHistory>> GetLatestAsync(int userId, int take, CancellationToken cancellationToken);
    Task<SearchHistory?> GetByIdAsync(int userId, int id, CancellationToken cancellationToken);
    Task<int> CountAsync(int userId, CancellationToken cancellationToken);
}
