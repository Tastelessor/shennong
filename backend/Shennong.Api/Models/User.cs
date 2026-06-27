using System.ComponentModel.DataAnnotations;

namespace Shennong.Api.Models;

public class User
{
    [Key]
    public string Id { get; set; } = string.Empty;
    
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    public string? Phone { get; set; }
    
    public string Password { get; set; } = string.Empty;
    
    public string? Name { get; set; }
    
    public string Role { get; set; } = "user";
    
    public string? InviterId { get; set; }
    
    public string PartnerStatus { get; set; } = "none";
    
    public string? CompanyName { get; set; }
    
    public string? CreditCode { get; set; }
    
    public string? LicensePath { get; set; }
}
