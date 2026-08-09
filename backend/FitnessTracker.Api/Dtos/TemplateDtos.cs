namespace FitnessTracker.Api.Dtos;

public record TemplateExerciseRequest(Guid ExerciseId, int Order, int TargetSets, int TargetReps, decimal? TargetWeightKg);
public record TemplateRequest(string Name, string? Description, List<TemplateExerciseRequest> Exercises);

public record TemplateExerciseResponse(Guid Id, Guid ExerciseId, string ExerciseName, int Order, int TargetSets, int TargetReps, decimal? TargetWeightKg);
public record TemplateResponse(Guid Id, string Name, string? Description, DateTime CreatedAt, List<TemplateExerciseResponse> Exercises);
