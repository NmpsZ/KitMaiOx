using System.Text.Json;

namespace KitmaiOx.API.Common;

public static class JsonList
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);

    public static string Serialize(IEnumerable<string> values)
    {
        var cleaned = values
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return JsonSerializer.Serialize(cleaned, Options);
    }

    public static List<string> Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new List<string>();
        }

        try
        {
            return JsonSerializer.Deserialize<List<string>>(json, Options) ?? new List<string>();
        }
        catch (JsonException)
        {
            return new List<string>();
        }
    }
}
