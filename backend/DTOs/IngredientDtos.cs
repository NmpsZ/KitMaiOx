using System.ComponentModel.DataAnnotations;

namespace KitmaiOx.API.DTOs;

public sealed class IngredientDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string IconEmoji { get; init; } = string.Empty;
    public bool IsCustom { get; init; }
}

public sealed class CreateIngredientRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Category { get; init; } = "Custom";

    [StringLength(16)]
    public string IconEmoji { get; init; } = "ðŸ¥¬";
}
public sealed class IngredientLookupDto
{
    public bool ExistsInDatabase { get; init; }
    public bool IsRealIngredient { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string IconEmoji { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public List<IngredientDto> Suggestions { get; init; } = new();
}

public sealed class IngredientValidationDto
{
    public bool IsRealIngredient { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Category { get; init; } = "Custom";
    public string IconEmoji { get; init; } = "🥬";
    public string Message { get; init; } = string.Empty;
}

