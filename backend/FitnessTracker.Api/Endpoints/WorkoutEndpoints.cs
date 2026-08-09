using FitnessTracker.Api.Data;
using FitnessTracker.Api.Dtos;
using FitnessTracker.Api.Models;
using FitnessTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Api.Endpoints;

public static class WorkoutEndpoints
{
    public static void MapWorkoutEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/workouts").WithTags("Workouts").RequireAuthorization();

        group.MapGet("/", async (AppDbContext db, CurrentUserService currentUser, int? take) =>
        {
            var userId = currentUser.RequireUserId();
            var sessions = await db.WorkoutSessions
                .Where(s => s.UserId == userId)
                .Include(s => s.Sets).ThenInclude(set => set.Exercise)
                .Include(s => s.Template)
                .OrderByDescending(s => s.StartedAt)
                .Take(take ?? 50)
                .ToListAsync();

            return Results.Ok(sessions.Select(ToResponse));
        });

        group.MapGet("/{id:guid}", async (Guid id, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var session = await db.WorkoutSessions
                .Where(s => s.Id == id && s.UserId == userId)
                .Include(s => s.Sets).ThenInclude(set => set.Exercise)
                .Include(s => s.Template)
                .FirstOrDefaultAsync();

            return session is null ? Results.NotFound() : Results.Ok(ToResponse(session));
        });

        group.MapPost("/", async (WorkoutSessionRequest request, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var session = new WorkoutSession
            {
                UserId = userId,
                Name = request.Name.Trim(),
                TemplateId = request.TemplateId,
                Notes = request.Notes,
                Sets = (request.Sets ?? new()).Select(s => new WorkoutSet
                {
                    ExerciseId = s.ExerciseId,
                    SetNumber = s.SetNumber,
                    Reps = s.Reps,
                    WeightKg = s.WeightKg,
                    Rpe = s.Rpe,
                    Completed = s.Completed
                }).ToList()
            };

            db.WorkoutSessions.Add(session);
            await db.SaveChangesAsync();

            await db.Entry(session).Collection(s => s.Sets).Query().Include(s => s.Exercise).LoadAsync();
            await db.Entry(session).Reference(s => s.Template).LoadAsync();

            return Results.Created($"/api/workouts/{session.Id}", ToResponse(session));
        });

        group.MapPut("/{id:guid}", async (Guid id, WorkoutSessionUpdateRequest request, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var session = await db.WorkoutSessions
                .Include(s => s.Sets).ThenInclude(set => set.Exercise)
                .Include(s => s.Template)
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (session is null) return Results.NotFound();

            session.Name = request.Name.Trim();
            session.Notes = request.Notes;
            if (request.Complete && session.CompletedAt is null)
                session.CompletedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return Results.Ok(ToResponse(session));
        });

        group.MapDelete("/{id:guid}", async (Guid id, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var session = await db.WorkoutSessions.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
            if (session is null) return Results.NotFound();

            db.WorkoutSessions.Remove(session);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        // Sets within a session
        group.MapPost("/{sessionId:guid}/sets", async (Guid sessionId, WorkoutSetRequest request, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var session = await db.WorkoutSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);
            if (session is null) return Results.NotFound(new { message = "Workout session not found." });

            var set = new WorkoutSet
            {
                SessionId = sessionId,
                ExerciseId = request.ExerciseId,
                SetNumber = request.SetNumber,
                Reps = request.Reps,
                WeightKg = request.WeightKg,
                Rpe = request.Rpe,
                Completed = request.Completed
            };
            db.WorkoutSets.Add(set);
            await db.SaveChangesAsync();
            await db.Entry(set).Reference(s => s.Exercise).LoadAsync();

            return Results.Created($"/api/workouts/{sessionId}/sets/{set.Id}", new WorkoutSetResponse(
                set.Id, set.ExerciseId, set.Exercise?.Name ?? string.Empty, set.SetNumber, set.Reps, set.WeightKg, set.Rpe, set.Completed));
        });

        group.MapPut("/{sessionId:guid}/sets/{setId:guid}", async (Guid sessionId, Guid setId, WorkoutSetRequest request, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var set = await db.WorkoutSets
                .Include(s => s.Session)
                .Include(s => s.Exercise)
                .FirstOrDefaultAsync(s => s.Id == setId && s.SessionId == sessionId && s.Session!.UserId == userId);

            if (set is null) return Results.NotFound();

            set.ExerciseId = request.ExerciseId;
            set.SetNumber = request.SetNumber;
            set.Reps = request.Reps;
            set.WeightKg = request.WeightKg;
            set.Rpe = request.Rpe;
            set.Completed = request.Completed;
            await db.SaveChangesAsync();
            await db.Entry(set).Reference(s => s.Exercise).LoadAsync();

            return Results.Ok(new WorkoutSetResponse(
                set.Id, set.ExerciseId, set.Exercise?.Name ?? string.Empty, set.SetNumber, set.Reps, set.WeightKg, set.Rpe, set.Completed));
        });

        group.MapDelete("/{sessionId:guid}/sets/{setId:guid}", async (Guid sessionId, Guid setId, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var set = await db.WorkoutSets
                .Include(s => s.Session)
                .FirstOrDefaultAsync(s => s.Id == setId && s.SessionId == sessionId && s.Session!.UserId == userId);

            if (set is null) return Results.NotFound();

            db.WorkoutSets.Remove(set);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }

    private static WorkoutSessionResponse ToResponse(WorkoutSession s) => new(
        s.Id, s.Name, s.TemplateId, s.Template?.Name, s.StartedAt, s.CompletedAt, s.Notes,
        s.Sets.OrderBy(x => x.SetNumber).Select(x => new WorkoutSetResponse(
            x.Id, x.ExerciseId, x.Exercise?.Name ?? string.Empty, x.SetNumber, x.Reps, x.WeightKg, x.Rpe, x.Completed
        )).ToList());
}
