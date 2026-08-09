namespace FitnessTracker.Api.Models;

public class BodyMetric
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public DateOnly Date { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? BodyFatPercent { get; set; }
    public decimal? ChestCm { get; set; }
    public decimal? WaistCm { get; set; }
    public decimal? HipsCm { get; set; }
    public decimal? ArmsCm { get; set; }
    public decimal? ThighsCm { get; set; }
    public string? Notes { get; set; }
}
