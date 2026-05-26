using System.ComponentModel.DataAnnotations;

namespace KitmaiOx.API.DTOs;

public sealed class SaveFavoriteRequest
{
    [Range(1, int.MaxValue)]
    public int RecipeId { get; init; }
}

public sealed class FavoriteRecipeDto
{
    public int Id { get; init; }
    public DateTimeOffset SavedAt { get; init; }
    public RecipeDto Recipe { get; init; } = new();
}
