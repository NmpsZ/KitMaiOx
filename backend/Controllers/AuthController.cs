using KitmaiOx.API.Data;
using KitmaiOx.API.DTOs;
using KitmaiOx.API.Models;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace KitmaiOx.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(AppDbContext context, IConfiguration configuration) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var normalizedUsername = request.Username.Trim().ToLowerInvariant();

        if (await context.Users.AnyAsync(u => u.Username.ToLower() == normalizedUsername, cancellationToken))
        {
            return BadRequest(new { error = "Username is already taken." });
        }

        var user = new User
        {
            Username = request.Username.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        context.Users.Add(user);
        await context.SaveChangesAsync(cancellationToken);

        var token = GenerateJwtToken(user);
        return Ok(new AuthResponse { Token = token, Username = user.Username });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var normalizedUsername = request.Username.Trim().ToLowerInvariant();
        var user = await context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedUsername, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { error = "Invalid username or password." });
        }

        var token = GenerateJwtToken(user);
        return Ok(new AuthResponse { Token = token, Username = user.Username });
    }

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> GoogleLogin(GoogleLoginRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);

            var email = payload.Email;
            var name = payload.Name ?? email.Split('@')[0];

            var normalizedName = name.ToLowerInvariant();
            var user = await context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedName, cancellationToken);

            if (user is null)
            {
                user = new User
                {
                    Username = name,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N"))
                };
                context.Users.Add(user);
                await context.SaveChangesAsync(cancellationToken);
            }

            var token = GenerateJwtToken(user);
            return Ok(new AuthResponse { Token = token, Username = user.Username });
        }
        catch (InvalidJwtException ex)
        {
            return BadRequest(new { error = $"Invalid Google token: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = $"Google Auth verification failed: {ex.Message}" });
        }
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "KitmaiOx_Super_Secret_Key_1234567890");

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = jwtSettings["Issuer"] ?? "KitmaiOx",
            Audience = jwtSettings["Audience"] ?? "KitmaiOx-Client",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        
        return tokenHandler.WriteToken(token);
    }
}
