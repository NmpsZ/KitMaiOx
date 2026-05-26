namespace KitmaiOx.API.Models;

public sealed class Recipe
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string IngredientsJson { get; set; } = "[]";
    public string StepsJson { get; set; } = "[]";
    public string Difficulty { get; set; } = "Easy";
    public int EstimatedTime { get; set; }
    public int CalorieEstimate { get; set; }
    public int Protein { get; set; }
    public int Carbs { get; set; }
    public int Fat { get; set; }
    public string IconEmoji { get; set; } = "🍽️";
    public string Language { get; set; } = "en";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public ICollection<FavoriteRecipe> Favorites { get; set; } = new List<FavoriteRecipe>();
}

