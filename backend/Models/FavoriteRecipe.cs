namespace KitmaiOx.API.Models;

public sealed class FavoriteRecipe
{
    public int Id { get; set; }
    public int RecipeId { get; set; }
    public Recipe Recipe { get; set; } = null!;
    public DateTimeOffset SavedAt { get; set; } = DateTimeOffset.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
