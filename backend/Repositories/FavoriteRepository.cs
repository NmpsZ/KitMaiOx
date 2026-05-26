using KitmaiOx.API.Data;
using KitmaiOx.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KitmaiOx.API.Repositories;

public sealed class FavoriteRepository(AppDbContext context) : IFavoriteRepository
{
    public async Task<FavoriteRecipe> AddAsync(int userId, int recipeId, CancellationToken cancellationToken)
    {
        var existing = await context.FavoriteRecipes
            .Include(x => x.Recipe)
            .FirstOrDefaultAsync(x => x.RecipeId == recipeId && x.UserId == userId, cancellationToken);

        if (existing is not null)
        {
            return existing;
        }

        var recipeExists = await context.Recipes.AnyAsync(x => x.Id == recipeId, cancellationToken);
        if (!recipeExists)
        {
            throw new KeyNotFoundException("Recipe was not found.");
        }

        var favorite = new FavoriteRecipe { RecipeId = recipeId, UserId = userId };
        context.FavoriteRecipes.Add(favorite);
        await context.SaveChangesAsync(cancellationToken);

        return await context.FavoriteRecipes
            .Include(x => x.Recipe)
            .FirstAsync(x => x.Id == favorite.Id, cancellationToken);
    }

    public Task<List<FavoriteRecipe>> GetAllAsync(int userId, CancellationToken cancellationToken) =>
        context.FavoriteRecipes
            .Include(x => x.Recipe)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.SavedAt)
            .ToListAsync(cancellationToken);

    public async Task<bool> DeleteAsync(int userId, int id, CancellationToken cancellationToken)
    {
        var favorite = await context.FavoriteRecipes
            .FirstOrDefaultAsync(x => x.UserId == userId && (x.Id == id || x.RecipeId == id), cancellationToken);
        if (favorite is null)
        {
            return false;
        }

        context.FavoriteRecipes.Remove(favorite);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task<int> CountAsync(int userId, CancellationToken cancellationToken) =>
        context.FavoriteRecipes.CountAsync(x => x.UserId == userId, cancellationToken);
}
