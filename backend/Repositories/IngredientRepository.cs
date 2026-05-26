using KitmaiOx.API.Data;
using KitmaiOx.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KitmaiOx.API.Repositories;

public sealed class IngredientRepository(AppDbContext context) : IIngredientRepository
{
    public Task<List<Ingredient>> GetAllAsync(string? query, CancellationToken cancellationToken)
    {
        var ingredients = context.Ingredients.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = query.Trim().ToLower();
            ingredients = ingredients.Where(x =>
                x.Name.ToLower().Contains(normalized) ||
                x.Category.ToLower().Contains(normalized));
        }

        return ingredients
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<Ingredient?> FindByNameAsync(string name, CancellationToken cancellationToken)
    {
        var normalized = name.Trim().ToLower();
        return context.Ingredients
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Name.ToLower() == normalized, cancellationToken);
    }
    public async Task<Ingredient> AddAsync(Ingredient ingredient, CancellationToken cancellationToken)
    {
        context.Ingredients.Add(ingredient);
        await context.SaveChangesAsync(cancellationToken);
        return ingredient;
    }
}

