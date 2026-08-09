namespace FitnessTracker.Api.Models;

public class WorkoutSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid? TemplateId { get; set; }
    public WorkoutTemplate? Template { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string? Notes { get; set; }

    public List<WorkoutSet> Sets { get; set; } = new();
}

public class WorkoutSet
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SessionId { get; set; }
    public WorkoutSession? Session { get; set; }
    public Guid ExerciseId { get; set; }
    public Exercise? Exercise { get; set; }
    public int SetNumber { get; set; }
    public int Reps { get; set; }
    public decimal WeightKg { get; set; }
    public int? Rpe { get; set; }
    public bool Completed { get; set; } = true;
}
