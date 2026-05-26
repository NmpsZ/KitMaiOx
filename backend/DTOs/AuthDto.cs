using System.ComponentModel.DataAnnotations;

namespace KitmaiOx.API.DTOs;

public sealed record RegisterRequest
{
    [Required, StringLength(50, MinimumLength = 3)]
    public string Username { get; set; } = null!;

    [Required, StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = null!;
}

public sealed record LoginRequest
{
    [Required]
    public string Username { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;
}

public sealed record AuthResponse
{
    public string Token { get; set; } = null!;
    public string Username { get; set; } = null!;
}

public sealed record GoogleLoginRequest
{
    [Required]
    public string IdToken { get; set; } = null!;
}
