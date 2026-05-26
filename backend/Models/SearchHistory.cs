namespace KitmaiOx.API.Models;

public sealed class SearchHistory
{
    public int Id { get; set; }
    public string IngredientsJson { get; set; } = "[]";
    public int ResultCount { get; set; }
    public DateTimeOffset SearchedAt { get; set; } = DateTimeOffset.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
