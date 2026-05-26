using KitmaiOx.API.DTOs;
using System.Net.Http.Json;
using System.Text.Json;

namespace KitmaiOx.API.Services;

public sealed class GeminiService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiService> logger)
    : IGeminiService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<List<RecipeSuggestionDto>> GenerateRecipesAsync(
        IReadOnlyList<string> ingredients,
        string language,
        CancellationToken cancellationToken)
    {
        var envKey = Environment.GetEnvironmentVariable("AI_API_KEY") ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        var apiKey = !string.IsNullOrWhiteSpace(envKey)
            ? envKey
            : configuration["AI:ApiKey"] ?? configuration["Gemini:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return BuildFallbackRecipes(ingredients, language, "[Debug Error] API Key is missing or empty!");
        }

        try
        {
            var model = configuration["Gemini:Model"] ?? "gemini-2.5-flash";
            var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={Uri.EscapeDataString(apiKey)}";
            var prompt = BuildPrompt(ingredients, language);
            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    responseMimeType = "application/json",
                    temperature = 0.7
                }
            };

            using var response = await httpClient.PostAsJsonAsync(endpoint, payload, cancellationToken);
            response.EnsureSuccessStatusCode();

            var rawJson = await response.Content.ReadAsStringAsync(cancellationToken);
            var modelText = ExtractModelText(rawJson);
            var recipes = ParseRecipeSuggestions(modelText);

            return recipes.Count > 0
                ? recipes.Select(x => NormalizeSuggestion(x, ingredients, language)).ToList()
                : BuildFallbackRecipes(ingredients, language);
        }
        catch (Exception ex) when (ex is HttpRequestException or JsonException or TaskCanceledException)
        {
            logger.LogWarning(ex, "Gemini request failed. Returning fallback recipes.");
            var errorMsg = $"[Debug Error] {ex.GetType().Name}: {ex.Message}";
            if (ex.InnerException != null)
            {
                errorMsg += $" -> {ex.InnerException.Message}";
            }
            return BuildFallbackRecipes(ingredients, language, errorMsg);
        }
    }


    public async Task<IngredientValidationDto> ValidateIngredientAsync(
        string query,
        string language,
        CancellationToken cancellationToken)
    {
        var cleanedQuery = query.Trim();
        if (cleanedQuery.Length < 2 || cleanedQuery.Any(char.IsDigit))
        {
            return new IngredientValidationDto
            {
                IsRealIngredient = false,
                Name = cleanedQuery,
                Message = language == "th"
                    ? "คำนี้ดูไม่เหมือนชื่อวัตถุดิบ ลองพิมพ์ใหม่อีกครั้ง"
                    : "This does not look like a real ingredient. Try another spelling."
            };
        }

        var envKey = Environment.GetEnvironmentVariable("AI_API_KEY") ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        var apiKey = !string.IsNullOrWhiteSpace(envKey)
            ? envKey
            : configuration["AI:ApiKey"] ?? configuration["Gemini:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return BuildLocalIngredientValidation(cleanedQuery, language);
        }

        try
        {
            var model = configuration["Gemini:Model"] ?? "gemini-2.5-flash";
            var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={Uri.EscapeDataString(apiKey)}";
            var prompt = BuildIngredientValidationPrompt(cleanedQuery, language);
            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    responseMimeType = "application/json",
                    temperature = 0.1
                }
            };

            using var response = await httpClient.PostAsJsonAsync(endpoint, payload, cancellationToken);
            response.EnsureSuccessStatusCode();

            var rawJson = await response.Content.ReadAsStringAsync(cancellationToken);
            var modelText = ExtractModelText(rawJson);
            var validation = ParseIngredientValidation(modelText);

            return NormalizeIngredientValidation(validation, cleanedQuery, language);
        }
        catch (Exception ex) when (ex is HttpRequestException or JsonException or TaskCanceledException)
        {
            logger.LogWarning(ex, "Gemini ingredient validation failed. Returning local validation.");
            return BuildLocalIngredientValidation(cleanedQuery, language);
        }
    }
    private static string BuildPrompt(IReadOnlyList<string> ingredients, string language)
    {
        var responseLanguage = language.Equals("th", StringComparison.OrdinalIgnoreCase)
            ? "Thai"
            : "English";

        return $$"""
        You are a practical home chef. The user has ONLY these primary ingredients: {{string.Join(", ", ingredients)}}.
        Suggest exactly 3 recipes that can be cooked at home.
        
        CRITICAL RULE: You MUST NOT add any other main ingredients, vegetables, meats, or distinct herbs (like basil, cilantro) that are NOT in the user's list. You may only assume basic pantry staples exist (salt, pepper, cooking oil, water). Do not invent or hallucinate ingredients!
        
        Reply in {{responseLanguage}}.
        Return only a JSON array. No markdown. No explanation outside JSON.

        JSON shape:
        [
          {
            "name": "recipe name",
            "difficulty": "Easy|Medium|Hard",
            "estimatedTime": 30,
            "calorieEstimate": 400,
            "protein": 25,
            "carbs": 40,
            "fat": 12,
            "iconEmoji": "🍳",
            "ingredients": ["ingredient 1", "ingredient 2"],
            "steps": ["step 1", "step 2"]
          }
        ]

        Rules for macros:
        - protein, carbs, fat are in grams per serving
        - iconEmoji is a single food emoji that best represents the dish
        """;
    }


    private static string BuildIngredientValidationPrompt(string query, string language)
    {
        var responseLanguage = language.Equals("th", StringComparison.OrdinalIgnoreCase)
            ? "Thai"
            : "English";

        return $$"""
        Decide whether this user text is a real edible cooking ingredient: "{{query}}".
        Correct obvious spelling mistakes and translate to a common English ingredient name if useful.
        If it is random typing, a brand-only term, a non-food object, or unsafe/non-edible, set isRealIngredient to false.
        Reply in {{responseLanguage}} for the message field.
        Return only JSON. No markdown.

        JSON shape:
        {
          "isRealIngredient": true,
          "name": "common ingredient name",
          "category": "Meat|Seafood|Dairy|Protein|Vegetable|Fruit|Carb|Seasoning|Herb|Pantry|Custom",
          "iconEmoji": "one food emoji",
          "message": "short helpful message"
        }
        """;
    }

    private static IngredientValidationDto ParseIngredientValidation(string modelText)
    {
        var cleaned = modelText
            .Replace("```json", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("```", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Trim();

        return JsonSerializer.Deserialize<IngredientValidationDto>(cleaned, JsonOptions)
            ?? new IngredientValidationDto { IsRealIngredient = false };
    }

    private static IngredientValidationDto NormalizeIngredientValidation(
        IngredientValidationDto validation,
        string originalQuery,
        string language)
    {
        if (!validation.IsRealIngredient)
        {
            return new IngredientValidationDto
            {
                IsRealIngredient = false,
                Name = originalQuery,
                Message = string.IsNullOrWhiteSpace(validation.Message)
                    ? (language == "th" ? "ไม่พบว่านี่เป็นวัตถุดิบที่ใช้ทำอาหารได้" : "I could not verify this as a real cooking ingredient.")
                    : validation.Message.Trim()
            };
        }

        return new IngredientValidationDto
        {
            IsRealIngredient = true,
            Name = string.IsNullOrWhiteSpace(validation.Name) ? ToTitleCase(originalQuery) : validation.Name.Trim(),
            Category = NormalizeIngredientCategory(validation.Category),
            IconEmoji = string.IsNullOrWhiteSpace(validation.IconEmoji) ? "🥬" : validation.IconEmoji.Trim(),
            Message = string.IsNullOrWhiteSpace(validation.Message)
                ? (language == "th" ? "AI ยืนยันว่าเป็นวัตถุดิบจริง" : "AI verified this as a real ingredient.")
                : validation.Message.Trim()
        };
    }

    private static IngredientValidationDto BuildLocalIngredientValidation(string query, string language)
    {
        var known = new Dictionary<string, (string Name, string Category, string Emoji)>(StringComparer.OrdinalIgnoreCase)
        {
            ["apple"] = ("Apple", "Fruit", "🍎"),
            ["banana"] = ("Banana", "Fruit", "🍌"),
            ["lettuce"] = ("Lettuce", "Vegetable", "🥬"),
            ["kale"] = ("Kale", "Vegetable", "🥬"),
            ["eggplant"] = ("Eggplant", "Vegetable", "🍆"),
            ["duck"] = ("Duck", "Meat", "🍗"),
            ["turkey"] = ("Turkey", "Meat", "🍗"),
            ["crab"] = ("Crab", "Seafood", "🦀"),
            ["clam"] = ("Clam", "Seafood", "🦪"),
            ["flour"] = ("Flour", "Pantry", "🌾"),
            ["sugar"] = ("Sugar", "Seasoning", "🧂"),
            ["vinegar"] = ("Vinegar", "Seasoning", "🧂"),
            ["honey"] = ("Honey", "Pantry", "🍯")
        };

        if (known.TryGetValue(query, out var ingredient))
        {
            return new IngredientValidationDto
            {
                IsRealIngredient = true,
                Name = ingredient.Name,
                Category = ingredient.Category,
                IconEmoji = ingredient.Emoji,
                Message = language == "th" ? "พบจากรายการวัตถุดิบพื้นฐาน" : "Found from common ingredient knowledge."
            };
        }

        var looksLikeWord = query.All(x => char.IsLetter(x) || char.IsWhiteSpace(x) || x == '-' || x == '\'')
            && query.Count(char.IsLetter) >= 3;

        return new IngredientValidationDto
        {
            IsRealIngredient = false,
            Name = query,
            Message = looksLikeWord
                ? (language == "th" ? "ยังยืนยันไม่ได้ว่านี่เป็นวัตถุดิบจริง ลองสะกดใหม่หรือเปิด Gemini API" : "I could not verify this ingredient locally. Check the spelling or enable Gemini API.")
                : (language == "th" ? "คำนี้ดูเหมือนพิมพ์มั่ว ไม่ใช่วัตถุดิบจริง" : "This looks like random text, not a real ingredient.")
        };
    }

    private static string NormalizeIngredientCategory(string category)
    {
        var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Meat", "Seafood", "Dairy", "Protein", "Vegetable", "Fruit", "Carb", "Seasoning", "Herb", "Pantry", "Custom"
        };

        var normalized = category.Trim();
        if (allowed.Contains(normalized))
        {
            return allowed.First(x => x.Equals(normalized, StringComparison.OrdinalIgnoreCase));
        }

        return "Custom";
    }

    private static string ToTitleCase(string value) => string.Join(
        " ",
        value.Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Select(x => char.ToUpperInvariant(x[0]) + x[1..].ToLowerInvariant()));
    private static string ExtractModelText(string rawJson)
    {
        using var document = JsonDocument.Parse(rawJson);
        var root = document.RootElement;

        return root.GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "[]";
    }

    private static List<RecipeSuggestionDto> ParseRecipeSuggestions(string modelText)
    {
        var cleaned = modelText
            .Replace("```json", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("```", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Trim();

        return JsonSerializer.Deserialize<List<RecipeSuggestionDto>>(cleaned, JsonOptions)
            ?? new List<RecipeSuggestionDto>();
    }

    private static RecipeSuggestionDto NormalizeSuggestion(
        RecipeSuggestionDto suggestion,
        IReadOnlyList<string> selectedIngredients,
        string language)
    {
        var ingredients = suggestion.Ingredients.Count > 0
            ? suggestion.Ingredients
            : selectedIngredients.ToList();

        var steps = suggestion.Steps.Count > 0
            ? suggestion.Steps
            : DefaultSteps(language, ingredients);

        return new RecipeSuggestionDto
        {
            Name = string.IsNullOrWhiteSpace(suggestion.Name)
                ? (language == "th" ? "เมนูจากของในตู้เย็น" : "Fridge-friendly recipe")
                : suggestion.Name.Trim(),
            Difficulty = NormalizeDifficulty(suggestion.Difficulty),
            EstimatedTime = suggestion.EstimatedTime > 0 ? suggestion.EstimatedTime : 25,
            CalorieEstimate = suggestion.CalorieEstimate > 0 ? suggestion.CalorieEstimate : 420,
            Protein = suggestion.Protein > 0 ? suggestion.Protein : 20,
            Carbs = suggestion.Carbs > 0 ? suggestion.Carbs : 35,
            Fat = suggestion.Fat > 0 ? suggestion.Fat : 10,
            IconEmoji = string.IsNullOrWhiteSpace(suggestion.IconEmoji) ? "🍽️" : suggestion.IconEmoji.Trim(),
            Ingredients = ingredients,
            Steps = steps
        };
    }

    private static string NormalizeDifficulty(string difficulty)
    {
        return difficulty.Trim().ToLowerInvariant() switch
        {
            "medium" => "Medium",
            "hard" => "Hard",
            _ => "Easy"
        };
    }

    private static List<RecipeSuggestionDto> BuildFallbackRecipes(IReadOnlyList<string> ingredients, string language, string? debugErrorName = null)
    {
        var first = ingredients.FirstOrDefault() ?? "Egg";
        var second = ingredients.Skip(1).FirstOrDefault() ?? "Rice";
        var third = ingredients.Skip(2).FirstOrDefault() ?? "Garlic";
        var selected = ingredients.Take(6).ToList();

        if (language == "th")
        {
            return new List<RecipeSuggestionDto>
            {
                new()
                {
                    Name = debugErrorName ?? $"ข้าวผัด {first}",
                    Difficulty = "Easy",
                    EstimatedTime = 20,
                    CalorieEstimate = 430,
                    Protein = 18,
                    Carbs = 52,
                    Fat = 14,
                    IconEmoji = "🍳",
                    Ingredients = selected.Concat(new[] { "Rice", "Soy sauce" }).Distinct().ToList(),
                    Steps = new List<string>
                    {
                        "เตรียมวัตถุดิบให้พร้อมและหั่นเป็นชิ้นพอดีคำ",
                        "ตั้งกระทะ ใส่น้ำมันเล็กน้อย แล้วผัดวัตถุดิบหลักจนสุก",
                        "ใส่ข้าวและเครื่องปรุง ผัดให้เข้ากัน",
                        "ชิมรส ปรับตามชอบ แล้วเสิร์ฟตอนร้อน"
                    }
                },
                new()
                {
                    Name = $"สลัดอุ่น {second}",
                    Difficulty = "Easy",
                    EstimatedTime = 15,
                    CalorieEstimate = 320,
                    Protein = 12,
                    Carbs = 28,
                    Fat = 18,
                    IconEmoji = "🥗",
                    Ingredients = selected.Concat(new[] { "Lime", "Olive oil" }).Distinct().ToList(),
                    Steps = new List<string>
                    {
                        "ลวกหรือย่างวัตถุดิบที่ต้องการให้สุกพอดี",
                        "ผสมน้ำสลัดจากมะนาว น้ำมัน และเครื่องปรุง",
                        "คลุกทุกอย่างเบา ๆ ให้เคลือบน้ำสลัด",
                        "จัดจานพร้อมโรยสมุนไพร"
                    }
                },
                new()
                {
                    Name = $"ซุปเร็ว {third}",
                    Difficulty = "Medium",
                    EstimatedTime = 30,
                    CalorieEstimate = 380,
                    Protein = 22,
                    Carbs = 30,
                    Fat = 16,
                    IconEmoji = "🍲",
                    Ingredients = selected.Concat(new[] { "Garlic", "Black pepper" }).Distinct().ToList(),
                    Steps = new List<string>
                    {
                        "ผัดกระเทียมและวัตถุดิบหอมจนมีกลิ่น",
                        "เติมน้ำหรือน้ำสต็อกแล้วต้มให้เดือด",
                        "ใส่วัตถุดิบที่เหลือ ต้มจนสุกนุ่ม",
                        "ปรุงรสและเสิร์ฟพร้อมข้าวหรือขนมปัง"
                    }
                }
            };
        }

        return new List<RecipeSuggestionDto>
        {
            new()
            {
                Name = debugErrorName ?? $"{first} fried rice",
                Difficulty = "Easy",
                EstimatedTime = 20,
                CalorieEstimate = 430,
                Protein = 18,
                Carbs = 52,
                Fat = 14,
                IconEmoji = "🍳",
                Ingredients = selected.Concat(new[] { "Rice", "Soy sauce" }).Distinct().ToList(),
                Steps = new List<string>
                {
                    "Prep the ingredients and cut everything into bite-size pieces.",
                    "Heat a pan with a little oil, then cook the main ingredient.",
                    "Add rice and seasoning, then stir-fry until evenly mixed.",
                    "Taste, adjust seasoning, and serve hot."
                }
            },
            new()
            {
                Name = $"Warm {second} salad",
                Difficulty = "Easy",
                EstimatedTime = 15,
                CalorieEstimate = 320,
                Protein = 12,
                Carbs = 28,
                Fat = 18,
                IconEmoji = "🥗",
                Ingredients = selected.Concat(new[] { "Lime", "Olive oil" }).Distinct().ToList(),
                Steps = new List<string>
                {
                    "Cook any ingredients that need heat until just tender.",
                    "Whisk lime, olive oil, salt, and pepper into a quick dressing.",
                    "Toss the ingredients gently with the dressing.",
                    "Plate and finish with herbs or crunchy toppings."
                }
            },
            new()
            {
                Name = $"Quick {third} soup",
                Difficulty = "Medium",
                EstimatedTime = 30,
                CalorieEstimate = 380,
                Protein = 22,
                Carbs = 30,
                Fat = 16,
                IconEmoji = "🍲",
                Ingredients = selected.Concat(new[] { "Garlic", "Black pepper" }).Distinct().ToList(),
                Steps = new List<string>
                {
                    "Saute aromatics until fragrant.",
                    "Add water or stock and bring it to a boil.",
                    "Add the remaining ingredients and simmer until tender.",
                    "Season to taste and serve with rice or bread."
                }
            }
        };
    }

    private static List<string> DefaultSteps(string language, IReadOnlyList<string> ingredients)
    {
        return language == "th"
            ? new List<string>
            {
                "เตรียมวัตถุดิบให้พร้อม",
                $"ปรุง {string.Join(", ", ingredients.Take(3))} จนสุก",
                "ชิมรสและจัดเสิร์ฟ"
            }
            : new List<string>
            {
                "Prepare the ingredients.",
                $"Cook {string.Join(", ", ingredients.Take(3))} until done.",
                "Taste, adjust seasoning, and serve."
            };
    }
}


