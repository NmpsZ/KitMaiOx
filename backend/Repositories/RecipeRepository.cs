using KitmaiOx.API.Data;
using KitmaiOx.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KitmaiOx.API.Repositories;

public sealed class RecipeRepository(AppDbContext context) : IRecipeRepository
{
    public async Task<List<Recipe>> AddManyAsync(IEnumerable<Recipe> recipes, CancellationToken cancellationToken)
    {
        var list = recipes.ToList();
        context.Recipes.AddRange(list);
        await context.SaveChangesAsync(cancellationToken);
        return list;
    }

    public Task<List<Recipe>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        var normalized = query.Trim().ToLowerInvariant();

        return context.Recipes
            .Where(x => x.Name.ToLower().Contains(normalized))
            .OrderByDescending(x => x.CreatedAt)
            .Take(30)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken) =>
        context.Recipes.CountAsync(cancellationToken);
}
