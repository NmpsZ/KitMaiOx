using KitmaiOx.API.Models;

namespace KitmaiOx.API.Repositories;

public interface IFavoriteRepository
{
    Task<FavoriteRecipe> AddAsync(int userId, int recipeId, CancellationToken cancellationToken);
    Task<List<FavoriteRecipe>> GetAllAsync(int userId, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int userId, int id, CancellationToken cancellationToken);
    Task<int> CountAsync(int userId, CancellationToken cancellationToken);
}
