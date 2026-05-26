using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KitmaiOx.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMacrosAndIconEmoji : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Carbs",
                table: "Recipes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Fat",
                table: "Recipes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "IconEmoji",
                table: "Recipes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Protein",
                table: "Recipes",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Carbs",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "Fat",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "IconEmoji",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "Protein",
                table: "Recipes");
        }
    }
}
