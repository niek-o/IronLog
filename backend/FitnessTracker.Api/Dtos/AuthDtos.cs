namespace FitnessTracker.Api.Dtos;

public record RegisterRequest(string Email, string Password, string FirstName, string LastName);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, DateTime ExpiresAt, UserResponse User);
public record UserResponse(Guid Id, string Email, string FirstName, string LastName);
