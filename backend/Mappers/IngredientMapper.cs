using KitmaiOx.API.DTOs;
using KitmaiOx.API.Models;

namespace KitmaiOx.API.Mappers;

public static class IngredientMapper
{
    public static IngredientDto ToDto(Ingredient ingredient) => new()
    {
        Id = ingredient.Id,
        Name = ingredient.Name,
        Category = ingredient.Category,
        IconEmoji = ingredient.IconEmoji,
        IsCustom = ingredient.IsCustom
    };
}
