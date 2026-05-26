using KitmaiOx.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KitmaiOx.API.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Ingredient> Ingredients => Set<Ingredient>();
    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<SearchHistory> SearchHistories => Set<SearchHistory>();
    public DbSet<FavoriteRecipe> FavoriteRecipes => Set<FavoriteRecipe>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Category).HasMaxLength(50).IsRequired();
            entity.Property(x => x.IconEmoji).HasMaxLength(16).IsRequired();
            entity.HasIndex(x => new { x.Name, x.Category }).IsUnique();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Username).HasMaxLength(50).IsRequired();
            entity.HasIndex(x => x.Username).IsUnique();
            entity.Property(x => x.PasswordHash).HasMaxLength(255).IsRequired();
        });

        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Difficulty).HasMaxLength(20).IsRequired();
            entity.Property(x => x.IngredientsJson).HasColumnType("text").IsRequired();
            entity.Property(x => x.StepsJson).HasColumnType("text").IsRequired();
            entity.Property(x => x.Language).HasMaxLength(5).IsRequired();
            entity.HasIndex(x => x.CreatedAt);
        });

        modelBuilder.Entity<SearchHistory>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.IngredientsJson).HasColumnType("text").IsRequired();
            entity.HasIndex(x => x.SearchedAt);
            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(x => x.UserId);
        });

        modelBuilder.Entity<FavoriteRecipe>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasOne(x => x.Recipe)
                .WithMany(x => x.Favorites)
                .HasForeignKey(x => x.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(x => new { x.UserId, x.RecipeId }).IsUnique();
            entity.HasIndex(x => x.SavedAt);
        });
    }
}
