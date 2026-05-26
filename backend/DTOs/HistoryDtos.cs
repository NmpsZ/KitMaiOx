namespace KitmaiOx.API.DTOs;

public sealed class SearchHistoryDto
{
    public int Id { get; init; }
    public List<string> Ingredients { get; init; } = new();
    public int ResultCount { get; init; }
    public DateTimeOffset SearchedAt { get; init; }
}
