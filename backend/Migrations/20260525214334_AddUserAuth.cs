using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace KitmaiOx.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAuth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM \"FavoriteRecipes\";");
            migrationBuilder.Sql("DELETE FROM \"SearchHistories\";");

            migrationBuilder.DropIndex(
                name: "IX_FavoriteRecipes_RecipeId",
                table: "FavoriteRecipes");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "SearchHistories",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "FavoriteRecipes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SearchHistories_UserId",
                table: "SearchHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteRecipes_RecipeId",
                table: "FavoriteRecipes",
                column: "RecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteRecipes_UserId_RecipeId",
                table: "FavoriteRecipes",
                columns: new[] { "UserId", "RecipeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_FavoriteRecipes_Users_UserId",
                table: "FavoriteRecipes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SearchHistories_Users_UserId",
                table: "SearchHistories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FavoriteRecipes_Users_UserId",
                table: "FavoriteRecipes");

            migrationBuilder.DropForeignKey(
                name: "FK_SearchHistories_Users_UserId",
                table: "SearchHistories");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_SearchHistories_UserId",
                table: "SearchHistories");

            migrationBuilder.DropIndex(
                name: "IX_FavoriteRecipes_RecipeId",
                table: "FavoriteRecipes");

            migrationBuilder.DropIndex(
                name: "IX_FavoriteRecipes_UserId_RecipeId",
                table: "FavoriteRecipes");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "SearchHistories");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "FavoriteRecipes");

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteRecipes_RecipeId",
                table: "FavoriteRecipes",
                column: "RecipeId",
                unique: true);
        }
    }
}
