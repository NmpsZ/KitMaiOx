using KitmaiOx.API.DTOs;

namespace KitmaiOx.API.Services;

public interface IFavoriteService
{
    Task<FavoriteRecipeDto> SaveAsync(int userId, SaveFavoriteRequest request, CancellationToken cancellationToken);
    Task<List<FavoriteRecipeDto>> GetAllAsync(int userId, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int userId, int id, CancellationToken cancellationToken);
}
