namespace Shennong.Api.Services;

public static class IdGenerator
{
    public static string Generate()
    {
        return Guid.NewGuid().ToString("N")[..9];
    }
}
