using FitnessTracker.Api.Models;

namespace FitnessTracker.Api.Dtos;

public record ExerciseRequest(string Name, MuscleCategory Category, string? Equipment, string? Notes);
public record ExerciseResponse(Guid Id, string Name, MuscleCategory Category, string? Equipment, string? Notes, bool IsCustom);
