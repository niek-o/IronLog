namespace FitnessTracker.Api.Models;

public class WorkoutTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<TemplateExercise> Exercises { get; set; } = new();
    public List<WorkoutSession> Sessions { get; set; } = new();
}

public class TemplateExercise
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TemplateId { get; set; }
    public WorkoutTemplate? Template { get; set; }
    public Guid ExerciseId { get; set; }
    public Exercise? Exercise { get; set; }
    public int Order { get; set; }
    public int TargetSets { get; set; } = 3;
    public int TargetReps { get; set; } = 10;
    public decimal? TargetWeightKg { get; set; }
}
