using FitnessTracker.Api.Data;
using FitnessTracker.Api.Dtos;
using FitnessTracker.Api.Models;
using FitnessTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Api.Endpoints;

public static class ExerciseEndpoints
{
    public static void MapExerciseEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/exercises").WithTags("Exercises").RequireAuthorization();

        group.MapGet("/", async (AppDbContext db, CurrentUserService currentUser, MuscleCategory? category) =>
        {
            var userId = currentUser.RequireUserId();
            var query = db.Exercises.Where(e => e.UserId == null || e.UserId == userId);

            if (category is not null)
                query = query.Where(e => e.Category == category);

            var exercises = await query
                .OrderBy(e => e.Category).ThenBy(e => e.Name)
                .Select(e => new ExerciseResponse(e.Id, e.Name, e.Category, e.Equipment, e.Notes, e.UserId != null))
                .ToListAsync();

            return Results.Ok(exercises);
        });

        group.MapPost("/", async (ExerciseRequest request, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var exercise = new Exercise
            {
                Name = request.Name.Trim(),
                Category = request.Category,
                Equipment = request.Equipment,
                Notes = request.Notes,
                UserId = userId
            };
            db.Exercises.Add(exercise);
            await db.SaveChangesAsync();

            return Results.Created($"/api/exercises/{exercise.Id}",
                new ExerciseResponse(exercise.Id, exercise.Name, exercise.Category, exercise.Equipment, exercise.Notes, true));
        });

        group.MapPut("/{id:guid}", async (Guid id, ExerciseRequest request, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var exercise = await db.Exercises.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
            if (exercise is null) return Results.NotFound(new { message = "Custom exercise not found." });

            exercise.Name = request.Name.Trim();
            exercise.Category = request.Category;
            exercise.Equipment = request.Equipment;
            exercise.Notes = request.Notes;
            await db.SaveChangesAsync();

            return Results.Ok(new ExerciseResponse(exercise.Id, exercise.Name, exercise.Category, exercise.Equipment, exercise.Notes, true));
        });

        group.MapDelete("/{id:guid}", async (Guid id, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var exercise = await db.Exercises.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
            if (exercise is null) return Results.NotFound(new { message = "Custom exercise not found." });

            db.Exercises.Remove(exercise);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
