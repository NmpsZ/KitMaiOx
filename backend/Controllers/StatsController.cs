using KitmaiOx.API.DTOs;
using KitmaiOx.API.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace KitmaiOx.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class StatsController(IStatsService statsService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<StatsDto>> Get(CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var stats = await statsService.GetAsync(userId, cancellationToken);
        return Ok(stats);
    }
}
