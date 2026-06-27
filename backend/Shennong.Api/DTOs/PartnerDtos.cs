namespace Shennong.Api.DTOs;

public record PartnerApplyDto(string UserId, string? CompanyName, string? CreditCode);
public record BindInviterDto(string UserId, string InviterId);
public record UpdatePasswordDto(string UserId, string OldPassword, string NewPassword);
