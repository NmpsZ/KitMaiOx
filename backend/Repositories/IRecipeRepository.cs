using KitmaiOx.API.Models;

namespace KitmaiOx.API.Repositories;

public interface IRecipeRepository
{
    Task<List<Recipe>> AddManyAsync(IEnumerable<Recipe> recipes, CancellationToken cancellationToken);
    Task<List<Recipe>> SearchAsync(string query, CancellationToken cancellationToken);
    Task<int> CountAsync(CancellationToken cancellationToken);
}
