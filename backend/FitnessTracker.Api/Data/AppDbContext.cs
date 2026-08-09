using FitnessTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<WorkoutTemplate> WorkoutTemplates => Set<WorkoutTemplate>();
    public DbSet<TemplateExercise> TemplateExercises => Set<TemplateExercise>();
    public DbSet<WorkoutSession> WorkoutSessions => Set<WorkoutSession>();
    public DbSet<WorkoutSet> WorkoutSets => Set<WorkoutSet>();
    public DbSet<BodyMetric> BodyMetrics => Set<BodyMetric>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(256).IsRequired();
            e.Property(u => u.FirstName).HasMaxLength(100);
            e.Property(u => u.LastName).HasMaxLength(100);
        });

        modelBuilder.Entity<Exercise>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(150).IsRequired();
            e.HasOne(x => x.User)
                .WithMany(u => u.Exercises)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WorkoutTemplate>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(150).IsRequired();
            e.HasOne(x => x.User)
                .WithMany(u => u.WorkoutTemplates)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TemplateExercise>(e =>
        {
            e.HasOne(x => x.Template)
                .WithMany(t => t.Exercises)
                .HasForeignKey(x => x.TemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Exercise)
                .WithMany(ex => ex.TemplateExercises)
                .HasForeignKey(x => x.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);

            e.Property(x => x.TargetWeightKg).HasPrecision(6, 2);
        });

        modelBuilder.Entity<WorkoutSession>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(150).IsRequired();
            e.HasOne(x => x.User)
                .WithMany(u => u.WorkoutSessions)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Template)
                .WithMany(t => t.Sessions)
                .HasForeignKey(x => x.TemplateId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<WorkoutSet>(e =>
        {
            e.Property(x => x.WeightKg).HasPrecision(6, 2);
            e.HasOne(x => x.Session)
                .WithMany(s => s.Sets)
                .HasForeignKey(x => x.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Exercise)
                .WithMany(ex => ex.WorkoutSets)
                .HasForeignKey(x => x.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<BodyMetric>(e =>
        {
            e.Property(x => x.WeightKg).HasPrecision(6, 2);
            e.Property(x => x.BodyFatPercent).HasPrecision(5, 2);
            e.Property(x => x.ChestCm).HasPrecision(6, 2);
            e.Property(x => x.WaistCm).HasPrecision(6, 2);
            e.Property(x => x.HipsCm).HasPrecision(6, 2);
            e.Property(x => x.ArmsCm).HasPrecision(6, 2);
            e.Property(x => x.ThighsCm).HasPrecision(6, 2);

            e.HasOne(x => x.User)
                .WithMany(u => u.BodyMetrics)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(x => new { x.UserId, x.Date });
        });

        // Seed a starter library of global exercises (UserId = null).
        var benchPress = Guid.Parse("11111111-1111-1111-1111-111111111101");
        var squat = Guid.Parse("11111111-1111-1111-1111-111111111102");
        var deadlift = Guid.Parse("11111111-1111-1111-1111-111111111103");
        var overheadPress = Guid.Parse("11111111-1111-1111-1111-111111111104");
        var pullUp = Guid.Parse("11111111-1111-1111-1111-111111111105");
        var barbellRow = Guid.Parse("11111111-1111-1111-1111-111111111106");
        var bicepCurl = Guid.Parse("11111111-1111-1111-1111-111111111107");
        var tricepPushdown = Guid.Parse("11111111-1111-1111-1111-111111111108");
        var legPress = Guid.Parse("11111111-1111-1111-1111-111111111109");
        var plank = Guid.Parse("11111111-1111-1111-1111-111111111110");
        var running = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var lunges = Guid.Parse("11111111-1111-1111-1111-111111111112");

        modelBuilder.Entity<Exercise>().HasData(
            new Exercise { Id = benchPress, Name = "Barbell Bench Press", Category = MuscleCategory.Chest, Equipment = "Barbell" },
            new Exercise { Id = squat, Name = "Back Squat", Category = MuscleCategory.Legs, Equipment = "Barbell" },
            new Exercise { Id = deadlift, Name = "Conventional Deadlift", Category = MuscleCategory.Back, Equipment = "Barbell" },
            new Exercise { Id = overheadPress, Name = "Overhead Press", Category = MuscleCategory.Shoulders, Equipment = "Barbell" },
            new Exercise { Id = pullUp, Name = "Pull-Up", Category = MuscleCategory.Back, Equipment = "Bodyweight" },
            new Exercise { Id = barbellRow, Name = "Barbell Row", Category = MuscleCategory.Back, Equipment = "Barbell" },
            new Exercise { Id = bicepCurl, Name = "Dumbbell Bicep Curl", Category = MuscleCategory.Arms, Equipment = "Dumbbell" },
            new Exercise { Id = tricepPushdown, Name = "Tricep Pushdown", Category = MuscleCategory.Arms, Equipment = "Cable" },
            new Exercise { Id = legPress, Name = "Leg Press", Category = MuscleCategory.Legs, Equipment = "Machine" },
            new Exercise { Id = plank, Name = "Plank", Category = MuscleCategory.Core, Equipment = "Bodyweight" },
            new Exercise { Id = running, Name = "Treadmill Run", Category = MuscleCategory.Cardio, Equipment = "Treadmill" },
            new Exercise { Id = lunges, Name = "Walking Lunges", Category = MuscleCategory.Legs, Equipment = "Dumbbell" }
        );
    }
}
