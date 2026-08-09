using FitnessTracker.Api.Data;
using FitnessTracker.Api.Dtos;
using FitnessTracker.Api.Models;
using FitnessTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Api.Endpoints;

public static class TemplateEndpoints
{
    public static void MapTemplateEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/templates").WithTags("Templates").RequireAuthorization();

        group.MapGet("/", async (AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var templates = await db.WorkoutTemplates
                .Where(t => t.UserId == userId)
                .Include(t => t.Exercises).ThenInclude(te => te.Exercise)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Results.Ok(templates.Select(ToResponse));
        });

        group.MapGet("/{id:guid}", async (Guid id, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var template = await db.WorkoutTemplates
                .Where(t => t.Id == id && t.UserId == userId)
                .Include(t => t.Exercises).ThenInclude(te => te.Exercise)
                .FirstOrDefaultAsync();

            return template is null ? Results.NotFound() : Results.Ok(ToResponse(template));
        });

        group.MapPost("/", async (TemplateRequest request, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var template = new WorkoutTemplate
            {
                UserId = userId,
                Name = request.Name.Trim(),
                Description = request.Description,
                Exercises = request.Exercises.Select(e => new TemplateExercise
                {
                    ExerciseId = e.ExerciseId,
                    Order = e.Order,
                    TargetSets = e.TargetSets,
                    TargetReps = e.TargetReps,
                    TargetWeightKg = e.TargetWeightKg
                }).ToList()
            };

            db.WorkoutTemplates.Add(template);
            await db.SaveChangesAsync();

            await db.Entry(template).Collection(t => t.Exercises).Query()
                .Include(te => te.Exercise).LoadAsync();

            return Results.Created($"/api/templates/{template.Id}", ToResponse(template));
        });

        group.MapPut("/{id:guid}", async (Guid id, TemplateRequest request, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var template = await db.WorkoutTemplates
                .Include(t => t.Exercises)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (template is null) return Results.NotFound();

            template.Name = request.Name.Trim();
            template.Description = request.Description;

            var newExercises = request.Exercises.Select(e => new TemplateExercise
            {
                TemplateId = template.Id,
                ExerciseId = e.ExerciseId,
                Order = e.Order,
                TargetSets = e.TargetSets,
                TargetReps = e.TargetReps,
                TargetWeightKg = e.TargetWeightKg
            }).ToList();

            db.TemplateExercises.RemoveRange(template.Exercises);
            db.TemplateExercises.AddRange(newExercises);
            template.Exercises = newExercises;

            await db.SaveChangesAsync();

            await db.Entry(template).Collection(t => t.Exercises).Query()
                .Include(te => te.Exercise).LoadAsync();

            return Results.Ok(ToResponse(template));
        });

        group.MapDelete("/{id:guid}", async (Guid id, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var template = await db.WorkoutTemplates.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (template is null) return Results.NotFound();

            db.WorkoutTemplates.Remove(template);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }

    private static TemplateResponse ToResponse(WorkoutTemplate t) => new(
        t.Id, t.Name, t.Description, t.CreatedAt,
        t.Exercises.OrderBy(e => e.Order).Select(e => new TemplateExerciseResponse(
            e.Id, e.ExerciseId, e.Exercise?.Name ?? string.Empty, e.Order, e.TargetSets, e.TargetReps, e.TargetWeightKg
        )).ToList());
}
