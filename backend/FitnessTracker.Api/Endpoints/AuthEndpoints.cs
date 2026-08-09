using FitnessTracker.Api.Data;
using FitnessTracker.Api.Dtos;
using FitnessTracker.Api.Models;
using FitnessTracker.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (
            RegisterRequest request,
            AppDbContext db,
            TokenService tokens) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return Results.BadRequest(new { message = "Email and password are required." });

            if (request.Password.Length < 8)
                return Results.BadRequest(new { message = "Password must be at least 8 characters." });

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var exists = await db.Users.AnyAsync(u => u.Email == normalizedEmail);
            if (exists)
                return Results.Conflict(new { message = "An account with this email already exists." });

            var user = new User
            {
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim()
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            var (token, expiresAt) = tokens.GenerateToken(user);
            return Results.Created($"/api/auth/me", new AuthResponse(
                token, expiresAt, new UserResponse(user.Id, user.Email, user.FirstName, user.LastName)));
        });

        group.MapPost("/login", async (
            LoginRequest request,
            AppDbContext db,
            TokenService tokens) =>
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Results.Json(new { message = "Invalid email or password." }, statusCode: 401);

            var (token, expiresAt) = tokens.GenerateToken(user);
            return Results.Ok(new AuthResponse(
                token, expiresAt, new UserResponse(user.Id, user.Email, user.FirstName, user.LastName)));
        });

        group.MapGet("/me", async (CurrentUserService currentUser, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(currentUser.RequireUserId());
            if (user is null) return Results.NotFound();
            return Results.Ok(new UserResponse(user.Id, user.Email, user.FirstName, user.LastName));
        }).RequireAuthorization();
    }
}
