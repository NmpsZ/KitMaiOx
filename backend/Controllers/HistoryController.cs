using KitmaiOx.API.DTOs;
using KitmaiOx.API.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace KitmaiOx.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class HistoryController(IRecipeService recipeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<SearchHistoryDto>>> GetAll(CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var history = await recipeService.GetHistoryAsync(userId, cancellationToken);
        return Ok(history);
    }

    [HttpGet("{id:int}/replay")]
    public async Task<ActionResult<List<RecipeDto>>> Replay(int id, CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var recipes = await recipeService.ReplayAsync(userId, id, cancellationToken);
        return Ok(recipes);
    }
}
