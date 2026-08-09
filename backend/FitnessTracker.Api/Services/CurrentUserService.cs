using System.Security.Claims;

namespace FitnessTracker.Api.Services;

public class CurrentUserService
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUserService(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    public Guid? UserId
    {
        get
        {
            var id = _accessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(id, out var guid) ? guid : null;
        }
    }

    public Guid RequireUserId() => UserId ?? throw new UnauthorizedAccessException("No authenticated user.");
}
