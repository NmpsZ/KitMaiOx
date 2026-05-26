using Npgsql;

namespace KitmaiOx.API.Data;

public static class DatabaseUrlParser
{
    public static string ToNpgsqlConnectionString(string databaseUrl)
    {
        // If it doesn't look like a URI (e.g. postgres://...), assume it's a standard connection string
        if (!databaseUrl.Contains("://"))
        {
            return databaseUrl;
        }

        var uri = new Uri(databaseUrl);
        var credentials = uri.UserInfo.Split(':', 2);
        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.TrimStart('/'),
            Username = Uri.UnescapeDataString(credentials.ElementAtOrDefault(0) ?? string.Empty),
            Password = Uri.UnescapeDataString(credentials.ElementAtOrDefault(1) ?? string.Empty),
            SslMode = SslMode.Require
        };

        return builder.ConnectionString;
    }
}
