using Microsoft.EntityFrameworkCore;

namespace KitmaiOx.API.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var autoCreate = app.Configuration.GetValue("Database:AutoCreate", true);

        if (autoCreate)
        {
            await context.Database.MigrateAsync();
        }

        if (!await context.Ingredients.AnyAsync())
        {
            context.Ingredients.AddRange(IngredientSeed.Items);
            await context.SaveChangesAsync();
        }
    }
}
