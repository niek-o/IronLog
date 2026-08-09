using FitnessTracker.Api.Data;
using FitnessTracker.Api.Dtos;
using FitnessTracker.Api.Models;
using FitnessTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Api.Endpoints;

public static class MetricEndpoints
{
    public static void MapMetricEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/metrics").WithTags("Body Metrics").RequireAuthorization();

        group.MapGet("/", async (AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var metrics = await db.BodyMetrics
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.Date)
                .Select(m => ToResponse(m))
                .ToListAsync();

            return Results.Ok(metrics);
        });

        group.MapPost("/", async (BodyMetricRequest request, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var metric = new BodyMetric
            {
                UserId = userId,
                Date = request.Date,
                WeightKg = request.WeightKg,
                BodyFatPercent = request.BodyFatPercent,
                ChestCm = request.ChestCm,
                WaistCm = request.WaistCm,
                HipsCm = request.HipsCm,
                ArmsCm = request.ArmsCm,
                ThighsCm = request.ThighsCm,
                Notes = request.Notes
            };

            db.BodyMetrics.Add(metric);
            await db.SaveChangesAsync();

            return Results.Created($"/api/metrics/{metric.Id}", ToResponse(metric));
        });

        group.MapPut("/{id:guid}", async (Guid id, BodyMetricRequest request, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var metric = await db.BodyMetrics.FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);
            if (metric is null) return Results.NotFound();

            metric.Date = request.Date;
            metric.WeightKg = request.WeightKg;
            metric.BodyFatPercent = request.BodyFatPercent;
            metric.ChestCm = request.ChestCm;
            metric.WaistCm = request.WaistCm;
            metric.HipsCm = request.HipsCm;
            metric.ArmsCm = request.ArmsCm;
            metric.ThighsCm = request.ThighsCm;
            metric.Notes = request.Notes;

            await db.SaveChangesAsync();
            return Results.Ok(ToResponse(metric));
        });

        group.MapDelete("/{id:guid}", async (Guid id, AppDbContext db, CurrentUserService currentUser) =>
        {
            var userId = currentUser.RequireUserId();
            var metric = await db.BodyMetrics.FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);
            if (metric is null) return Results.NotFound();

            db.BodyMetrics.Remove(metric);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }

    private static BodyMetricResponse ToResponse(BodyMetric m) => new(
        m.Id, m.Date, m.WeightKg, m.BodyFatPercent, m.ChestCm, m.WaistCm, m.HipsCm, m.ArmsCm, m.ThighsCm, m.Notes);
}
