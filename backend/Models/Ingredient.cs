namespace KitmaiOx.API.Models;

public sealed class Ingredient
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string IconEmoji { get; set; } = "🥬";
    public bool IsCustom { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
