namespace FitnessTracker.Api.Dtos;

public record BodyMetricRequest(
    DateOnly Date,
    decimal? WeightKg,
    decimal? BodyFatPercent,
    decimal? ChestCm,
    decimal? WaistCm,
    decimal? HipsCm,
    decimal? ArmsCm,
    decimal? ThighsCm,
    string? Notes);

public record BodyMetricResponse(
    Guid Id,
    DateOnly Date,
    decimal? WeightKg,
    decimal? BodyFatPercent,
    decimal? ChestCm,
    decimal? WaistCm,
    decimal? HipsCm,
    decimal? ArmsCm,
    decimal? ThighsCm,
    string? Notes);
