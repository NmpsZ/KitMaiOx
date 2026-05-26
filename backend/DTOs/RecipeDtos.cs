using System.ComponentModel.DataAnnotations;

namespace KitmaiOx.API.DTOs;

public sealed class SuggestRecipeRequest
{
    [Required]
    [MinLength(1)]
    public List<string> Ingredients { get; init; } = new();

    [RegularExpression("^(th|en)$")]
    public string Language { get; init; } = "en";
}

public sealed class RecipeDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Difficulty { get; init; } = "Easy";
    public int EstimatedTime { get; init; }
    public int CalorieEstimate { get; init; }
    public int Protein { get; init; }
    public int Carbs { get; init; }
    public int Fat { get; init; }
    public string IconEmoji { get; init; } = "🍽️";
    public List<string> Ingredients { get; init; } = new();
    public List<string> Steps { get; init; } = new();
    public string Language { get; init; } = "en";
    public DateTimeOffset CreatedAt { get; init; }
}

public sealed class RecipeSuggestionDto
{
    public string Name { get; init; } = string.Empty;
    public string Difficulty { get; init; } = "Easy";
    public int EstimatedTime { get; init; }
    public int CalorieEstimate { get; init; }
    public int Protein { get; init; }
    public int Carbs { get; init; }
    public int Fat { get; init; }
    public string IconEmoji { get; init; } = "🍽️";
    public List<string> Ingredients { get; init; } = new();
    public List<string> Steps { get; init; } = new();
}
