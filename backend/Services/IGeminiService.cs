using KitmaiOx.API.DTOs;

namespace KitmaiOx.API.Services;

public interface IGeminiService
{
    Task<List<RecipeSuggestionDto>> GenerateRecipesAsync(
        IReadOnlyList<string> ingredients,
        string language,
        CancellationToken cancellationToken);

    Task<IngredientValidationDto> ValidateIngredientAsync(
        string query,
        string language,
        CancellationToken cancellationToken);
}

