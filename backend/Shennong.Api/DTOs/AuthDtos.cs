namespace Shennong.Api.DTOs;

public record RegisterDto(string Email, string? Phone, string Password, string? Name);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Id, string Email, string? Name, string Role);
