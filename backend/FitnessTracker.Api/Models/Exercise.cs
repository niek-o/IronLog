namespace FitnessTracker.Api.Models;

public enum MuscleCategory
{
    Chest, Back, Shoulders, Arms, Legs, Core, Cardio, FullBody
}

public class Exercise
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public MuscleCategory Category { get; set; }
    public string? Equipment { get; set; }
    public string? Notes { get; set; }

    // Null UserId = a global/built-in exercise available to everyone.
    // Non-null = a custom exercise created by that user.
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public List<TemplateExercise> TemplateExercises { get; set; } = new();
    public List<WorkoutSet> WorkoutSets { get; set; } = new();
}
