using KitmaiOx.API.DTOs;
using KitmaiOx.API.Mappers;
using KitmaiOx.API.Repositories;

namespace KitmaiOx.API.Services;

public sealed class FavoriteService(IFavoriteRepository favoriteRepository) : IFavoriteService
{
    public async Task<FavoriteRecipeDto> SaveAsync(int userId, SaveFavoriteRequest request, CancellationToken cancellationToken)
    {
        var favorite = await favoriteRepository.AddAsync(userId, request.RecipeId, cancellationToken);
        return RecipeMapper.ToDto(favorite);
    }

    public async Task<List<FavoriteRecipeDto>> GetAllAsync(int userId, CancellationToken cancellationToken)
    {
        var favorites = await favoriteRepository.GetAllAsync(userId, cancellationToken);
        return favorites.Select(RecipeMapper.ToDto).ToList();
    }

    public Task<bool> DeleteAsync(int userId, int id, CancellationToken cancellationToken) =>
        favoriteRepository.DeleteAsync(userId, id, cancellationToken);
}
