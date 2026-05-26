namespace KitmaiOx.API.DTOs;

public sealed class StatsDto
{
    public int TotalSearches { get; init; }
    public int FavoriteCount { get; init; }
    public int RecipeCount { get; init; }
    public int IngredientUseCount { get; init; }
    public List<IngredientStatDto> TopIngredients { get; init; } = new();
}

public sealed class IngredientStatDto
{
    public string Name { get; init; } = string.Empty;
    public int UseCount { get; init; }
}
