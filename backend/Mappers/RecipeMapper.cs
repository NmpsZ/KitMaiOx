using KitmaiOx.API.Common;
using KitmaiOx.API.DTOs;
using KitmaiOx.API.Models;

namespace KitmaiOx.API.Mappers;

public static class RecipeMapper
{
    public static RecipeDto ToDto(Recipe recipe) => new()
    {
        Id = recipe.Id,
        Name = recipe.Name,
        Difficulty = recipe.Difficulty,
        EstimatedTime = recipe.EstimatedTime,
        CalorieEstimate = recipe.CalorieEstimate,
        Protein = recipe.Protein,
        Carbs = recipe.Carbs,
        Fat = recipe.Fat,
        IconEmoji = recipe.IconEmoji,
        Ingredients = JsonList.Deserialize(recipe.IngredientsJson),
        Steps = JsonList.Deserialize(recipe.StepsJson),
        Language = recipe.Language,
        CreatedAt = recipe.CreatedAt
    };

    public static FavoriteRecipeDto ToDto(FavoriteRecipe favorite) => new()
    {
        Id = favorite.Id,
        SavedAt = favorite.SavedAt,
        Recipe = ToDto(favorite.Recipe)
    };

    public static SearchHistoryDto ToDto(SearchHistory history) => new()
    {
        Id = history.Id,
        Ingredients = JsonList.Deserialize(history.IngredientsJson),
        ResultCount = history.ResultCount,
        SearchedAt = history.SearchedAt
    };
}
