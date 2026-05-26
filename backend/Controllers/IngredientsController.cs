using KitmaiOx.API.Common;
using KitmaiOx.API.DTOs;
using KitmaiOx.API.Mappers;
using KitmaiOx.API.Models;
using KitmaiOx.API.Repositories;
using KitmaiOx.API.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KitmaiOx.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class IngredientsController(
    IIngredientRepository ingredientRepository,
    IHistoryRepository historyRepository,
    IGeminiService geminiService)
    : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<List<IngredientDto>>> GetAll(
        [FromQuery] string? q,
        CancellationToken cancellationToken)
    {
        var ingredients = await ingredientRepository.GetAllAsync(q, cancellationToken);
        return Ok(ingredients.Select(IngredientMapper.ToDto));
    }


    [AllowAnonymous]
    [HttpGet("lookup")]
    public async Task<ActionResult<IngredientLookupDto>> Lookup(
        [FromQuery] string q,
        [FromQuery] string language = "en",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return BadRequest(new { error = "Enter an ingredient name." });
        }

        var query = q.Trim();
        var suggestions = await ingredientRepository.GetAllAsync(query, cancellationToken);
        var exactMatch = await ingredientRepository.FindByNameAsync(query, cancellationToken);

        if (exactMatch is not null)
        {
            return Ok(new IngredientLookupDto
            {
                ExistsInDatabase = true,
                IsRealIngredient = true,
                Name = exactMatch.Name,
                Category = exactMatch.Category,
                IconEmoji = exactMatch.IconEmoji,
                Message = language == "th" ? "พบวัตถุดิบนี้ในฐานข้อมูลแล้ว" : "Found this ingredient in the database.",
                Suggestions = suggestions.Select(IngredientMapper.ToDto).ToList()
            });
        }

        if (suggestions.Count > 0)
        {
            return Ok(new IngredientLookupDto
            {
                ExistsInDatabase = true,
                IsRealIngredient = true,
                Name = suggestions[0].Name,
                Category = suggestions[0].Category,
                IconEmoji = suggestions[0].IconEmoji,
                Message = language == "th" ? "พบรายการใกล้เคียงในฐานข้อมูล" : "Found close matches in the database.",
                Suggestions = suggestions.Select(IngredientMapper.ToDto).ToList()
            });
        }

        var aiResult = await geminiService.ValidateIngredientAsync(query, language, cancellationToken);
        return Ok(new IngredientLookupDto
        {
            ExistsInDatabase = false,
            IsRealIngredient = aiResult.IsRealIngredient,
            Name = aiResult.Name,
            Category = aiResult.Category,
            IconEmoji = aiResult.IconEmoji,
            Message = aiResult.Message,
            Suggestions = new List<IngredientDto>()
        });
    }
    [HttpGet("recent")]
    public async Task<ActionResult<List<string>>> GetRecent(CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var histories = await historyRepository.GetLatestAsync(userId, 20, cancellationToken);
        var recent = histories
            .SelectMany(x => JsonList.Deserialize(x.IngredientsJson))
            .GroupBy(x => x, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(x => x.Count())
            .ThenBy(x => x.Key)
            .Take(10)
            .Select(x => x.Key)
            .ToList();

        return Ok(recent);
    }

    [HttpPost("custom")]
    public async Task<ActionResult<IngredientDto>> Create(
        CreateIngredientRequest request,
        CancellationToken cancellationToken)
    {
        var ingredient = await ingredientRepository.AddAsync(new Ingredient
        {
            Name = request.Name.Trim(),
            Category = request.Category.Trim(),
            IconEmoji = string.IsNullOrWhiteSpace(request.IconEmoji) ? "🥬" : request.IconEmoji.Trim(),
            IsCustom = true
        }, cancellationToken);

        return CreatedAtAction(nameof(GetAll), new { id = ingredient.Id }, IngredientMapper.ToDto(ingredient));
    }
}

