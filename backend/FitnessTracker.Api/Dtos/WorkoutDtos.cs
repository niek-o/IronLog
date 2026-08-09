namespace FitnessTracker.Api.Dtos;

public record WorkoutSetRequest(Guid ExerciseId, int SetNumber, int Reps, decimal WeightKg, int? Rpe, bool Completed);
public record WorkoutSessionRequest(string Name, Guid? TemplateId, string? Notes, List<WorkoutSetRequest>? Sets);
public record WorkoutSessionUpdateRequest(string Name, string? Notes, bool Complete);

public record WorkoutSetResponse(Guid Id, Guid ExerciseId, string ExerciseName, int SetNumber, int Reps, decimal WeightKg, int? Rpe, bool Completed);
public record WorkoutSessionResponse(Guid Id, string Name, Guid? TemplateId, string? TemplateName, DateTime StartedAt, DateTime? CompletedAt, string? Notes, List<WorkoutSetResponse> Sets);
