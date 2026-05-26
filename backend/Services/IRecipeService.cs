using KitmaiOx.API.DTOs;

namespace KitmaiOx.API.Services;

public interface IRecipeService
{
    Task<List<RecipeDto>> SuggestAsync(int userId, SuggestRecipeRequest request, CancellationToken cancellationToken);
    Task<List<RecipeDto>> SearchAsync(string query, CancellationToken cancellationToken);
    Task<List<SearchHistoryDto>> GetHistoryAsync(int userId, CancellationToken cancellationToken);
    Task<List<RecipeDto>> ReplayAsync(int userId, int historyId, CancellationToken cancellationToken);
}
