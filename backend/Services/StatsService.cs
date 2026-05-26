using KitmaiOx.API.Common;
using KitmaiOx.API.DTOs;
using KitmaiOx.API.Repositories;

namespace KitmaiOx.API.Services;

public sealed class StatsService(
    IHistoryRepository historyRepository,
    IFavoriteRepository favoriteRepository,
    IRecipeRepository recipeRepository)
    : IStatsService
{
    public async Task<StatsDto> GetAsync(int userId, CancellationToken cancellationToken)
    {
        var histories = await historyRepository.GetLatestAsync(userId, 500, cancellationToken);
        var topIngredients = histories
            .SelectMany(x => JsonList.Deserialize(x.IngredientsJson))
            .GroupBy(x => x, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(x => x.Count())
            .ThenBy(x => x.Key)
            .Take(10)
            .Select(x => new IngredientStatDto { Name = x.Key, UseCount = x.Count() })
            .ToList();

        return new StatsDto
        {
            TotalSearches = await historyRepository.CountAsync(userId, cancellationToken),
            FavoriteCount = await favoriteRepository.CountAsync(userId, cancellationToken),
            RecipeCount = await recipeRepository.CountAsync(cancellationToken),
            IngredientUseCount = topIngredients.Sum(x => x.UseCount),
            TopIngredients = topIngredients
        };
    }
}
