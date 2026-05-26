using KitmaiOx.API.Data;
using KitmaiOx.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KitmaiOx.API.Repositories;

public sealed class HistoryRepository(AppDbContext context) : IHistoryRepository
{
    public async Task<SearchHistory> AddAsync(SearchHistory history, CancellationToken cancellationToken)
    {
        context.SearchHistories.Add(history);
        await context.SaveChangesAsync(cancellationToken);
        return history;
    }

    public Task<List<SearchHistory>> GetLatestAsync(int userId, int take, CancellationToken cancellationToken) =>
        context.SearchHistories
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.SearchedAt)
            .Take(take)
            .ToListAsync(cancellationToken);

    public Task<SearchHistory?> GetByIdAsync(int userId, int id, CancellationToken cancellationToken) =>
        context.SearchHistories.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, cancellationToken);

    public Task<int> CountAsync(int userId, CancellationToken cancellationToken) =>
        context.SearchHistories.CountAsync(x => x.UserId == userId, cancellationToken);
}
