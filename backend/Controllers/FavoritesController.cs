using KitmaiOx.API.DTOs;
using KitmaiOx.API.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace KitmaiOx.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class FavoritesController(IFavoriteService favoriteService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<FavoriteRecipeDto>>> GetAll(CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var favorites = await favoriteService.GetAllAsync(userId, cancellationToken);
        return Ok(favorites);
    }

    [HttpPost]
    public async Task<ActionResult<FavoriteRecipeDto>> Save(
        SaveFavoriteRequest request,
        CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var favorite = await favoriteService.SaveAsync(userId, request, cancellationToken);
        return Ok(favorite);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var deleted = await favoriteService.DeleteAsync(userId, id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
