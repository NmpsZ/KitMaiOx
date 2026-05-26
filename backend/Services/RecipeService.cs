using KitmaiOx.API.Common;
using KitmaiOx.API.DTOs;
using KitmaiOx.API.Mappers;
using KitmaiOx.API.Models;
using KitmaiOx.API.Repositories;
using System.Text.Json;

namespace KitmaiOx.API.Services;

public sealed class RecipeService(
    IGeminiService geminiService,
    IRecipeRepository recipeRepository,
    IHistoryRepository historyRepository)
    : IRecipeService
{
    public async Task<List<RecipeDto>> SuggestAsync(int userId, SuggestRecipeRequest request, CancellationToken cancellationToken)
    {
        var ingredients = CleanIngredients(request.Ingredients);
        if (ingredients.Count == 0)
        {
            throw new InvalidOperationException("Select at least one ingredient.");
        }

        var suggestions = await geminiService.GenerateRecipesAsync(ingredients, request.Language, cancellationToken);
        var recipes = suggestions.Select(x => new Recipe
        {
            Name = x.Name,
            Difficulty = x.Difficulty,
            EstimatedTime = x.EstimatedTime,
            CalorieEstimate = x.CalorieEstimate,
            Protein = x.Protein,
            Carbs = x.Carbs,
            Fat = x.Fat,
            IconEmoji = string.IsNullOrWhiteSpace(x.IconEmoji) ? "🍽️" : x.IconEmoji,
            IngredientsJson = JsonList.Serialize(x.Ingredients),
            StepsJson = JsonList.Serialize(x.Steps),
            Language = request.Language
        });

        var savedRecipes = await recipeRepository.AddManyAsync(recipes, cancellationToken);

        if (userId > 0)
        {
            var history = new SearchHistory
            {
                IngredientsJson = JsonList.Serialize(ingredients),
                ResultCount = savedRecipes.Count,
                UserId = userId
            };
            await historyRepository.AddAsync(history, cancellationToken);
        }

        return savedRecipes.Select(RecipeMapper.ToDto).ToList();
    }

    public async Task<List<RecipeDto>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return new List<RecipeDto>();
        }

        var recipes = await recipeRepository.SearchAsync(query, cancellationToken);
        return recipes.Select(RecipeMapper.ToDto).ToList();
    }

    public async Task<List<SearchHistoryDto>> GetHistoryAsync(int userId, CancellationToken cancellationToken)
    {
        var histories = await historyRepository.GetLatestAsync(userId, 20, cancellationToken);
        return histories.Select(RecipeMapper.ToDto).ToList();
    }

    public async Task<List<RecipeDto>> ReplayAsync(int userId, int historyId, CancellationToken cancellationToken)
    {
        var history = await historyRepository.GetByIdAsync(userId, historyId, cancellationToken)
            ?? throw new KeyNotFoundException("Search history was not found.");

        var ingredients = JsonSerializer.Deserialize<List<string>>(history.IngredientsJson) ?? new();
        return await SuggestAsync(userId, new SuggestRecipeRequest { Ingredients = ingredients, Language = "en" }, cancellationToken);
    }

    private static List<string> CleanIngredients(IEnumerable<string> ingredients) =>
        ingredients
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(20)
            .ToList();
}
