namespace Shennong.Api.DTOs;

public record CreateAppointmentDto(
    string? UserId,
    string? UserName,
    string? UserPhone,
    string? Date,
    string? Service,
    string? Description
);
