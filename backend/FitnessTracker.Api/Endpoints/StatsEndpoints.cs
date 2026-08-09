using FitnessTracker.Api.Data;
using FitnessTracker.Api.Dtos;
using FitnessTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Api.Endpoints;

public static class StatsEndpoints
{
    public static void MapStatsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/stats").WithTags("Stats").RequireAuthorization();

        // Progress over time for a single exercise: max weight, total reps, and estimated 1RM (Epley formula) per session.
        group.MapGet("/progress/{exerciseId:guid}", async (Guid exerciseId, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();

            var exercise = await db.Exercises.FirstOrDefaultAsync(e => e.Id == exerciseId && (e.UserId == null || e.UserId == userId));
            if (exercise is null) return Results.NotFound(new { message = "Exercise not found." });

            var sets = await db.WorkoutSets
                .Where(s => s.ExerciseId == exerciseId && s.Session!.UserId == userId && s.Completed)
                .Include(s => s.Session)
                .ToListAsync();

            var points = sets
                .GroupBy(s => s.Session!.StartedAt.Date)
                .OrderBy(g => g.Key)
                .Select(g =>
                {
                    var maxWeight = g.Max(s => s.WeightKg);
                    var totalReps = g.Sum(s => s.Reps);
                    var best1Rm = g.Max(s => s.WeightKg * (1 + s.Reps / 30m));
                    return new ExerciseProgressPoint(g.Key, maxWeight, totalReps, Math.Round(best1Rm, 1));
                })
                .ToList();

            return Results.Ok(new ExerciseProgressResponse(exercise.Id, exercise.Name, points));
        });

        // Dashboard summary: workout counts, weekly volume trend, current streak, and latest body metric.
        group.MapGet("/dashboard", async (AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var now = DateTime.UtcNow;
            var startOfWeek = now.Date.AddDays(-(int)now.DayOfWeek);

            var sessions = await db.WorkoutSessions
                .Where(s => s.UserId == userId)
                .Include(s => s.Sets)
                .OrderByDescending(s => s.StartedAt)
                .ToListAsync();

            var totalWorkouts = sessions.Count;
            var workoutsThisWeek = sessions.Count(s => s.StartedAt >= startOfWeek);
            var volumeThisWeek = sessions
                .Where(s => s.StartedAt >= startOfWeek)
                .SelectMany(s => s.Sets)
                .Sum(set => set.WeightKg * set.Reps);

            // Weekly volume for the last 8 weeks
            var eightWeeksAgo = now.Date.AddDays(-56);
            var weeklyVolume = sessions
                .Where(s => s.StartedAt >= eightWeeksAgo)
                .SelectMany(s => s.Sets.Select(set => (s.StartedAt, set)))
                .GroupBy(x =>
                {
                    var d = x.StartedAt.Date;
                    var weekStart = d.AddDays(-(int)d.DayOfWeek);
                    return DateOnly.FromDateTime(weekStart);
                })
                .OrderBy(g => g.Key)
                .Select(g => new VolumePoint(g.Key, g.Sum(x => x.set.WeightKg * x.set.Reps), g.Count()))
                .ToList();

            // Current streak: consecutive days (walking backward from today) with at least one workout
            var workoutDays = sessions.Select(s => s.StartedAt.Date).Distinct().OrderByDescending(d => d).ToList();
            var streak = 0;
            var cursor = now.Date;
            foreach (var day in workoutDays)
            {
                if (day == cursor) { streak++; cursor = cursor.AddDays(-1); }
                else if (day == cursor.AddDays(1)) { continue; }
                else break;
            }

            var latestMetric = await db.BodyMetrics
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.Date)
                .Select(m => new BodyMetricResponse(m.Id, m.Date, m.WeightKg, m.BodyFatPercent, m.ChestCm, m.WaistCm, m.HipsCm, m.ArmsCm, m.ThighsCm, m.Notes))
                .FirstOrDefaultAsync();

            return Results.Ok(new DashboardSummary(
                totalWorkouts, workoutsThisWeek, volumeThisWeek, streak, weeklyVolume, latestMetric));
        });
    }
}
