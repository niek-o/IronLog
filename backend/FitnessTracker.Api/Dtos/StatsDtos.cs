namespace FitnessTracker.Api.Dtos;

public record ExerciseProgressPoint(DateTime Date, decimal MaxWeightKg, int TotalReps, decimal EstimatedOneRepMax);
public record ExerciseProgressResponse(Guid ExerciseId, string ExerciseName, List<ExerciseProgressPoint> Points);

public record VolumePoint(DateOnly Week, decimal TotalVolumeKg, int SetCount);
public record DashboardSummary(
    int TotalWorkouts,
    int WorkoutsThisWeek,
    decimal TotalVolumeKgThisWeek,
    int CurrentStreakDays,
    List<VolumePoint> WeeklyVolume,
    BodyMetricResponse? LatestBodyMetric);
