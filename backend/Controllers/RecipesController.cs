using KitmaiOx.API.DTOs;
using KitmaiOx.API.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace KitmaiOx.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class RecipesController(IRecipeService recipeService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("suggest")]
    public async Task<ActionResult<List<RecipeDto>>> Suggest(
        SuggestRecipeRequest request,
        CancellationToken cancellationToken)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = 0;
        if (!string.IsNullOrEmpty(userIdStr))
        {
            userId = int.Parse(userIdStr);
        }
        var recipes = await recipeService.SuggestAsync(userId, request, cancellationToken);
        return Ok(recipes);
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<RecipeDto>>> Search(
        [FromQuery] string q,
        CancellationToken cancellationToken)
    {
        var recipes = await recipeService.SearchAsync(q, cancellationToken);
        return Ok(recipes);
    }
}
