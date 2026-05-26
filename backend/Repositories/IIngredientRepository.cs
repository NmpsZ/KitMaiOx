using KitmaiOx.API.Models;

namespace KitmaiOx.API.Repositories;

public interface IIngredientRepository
{
    Task<List<Ingredient>> GetAllAsync(string? query, CancellationToken cancellationToken);
    Task<Ingredient?> FindByNameAsync(string name, CancellationToken cancellationToken);
    Task<Ingredient> AddAsync(Ingredient ingredient, CancellationToken cancellationToken);
}

