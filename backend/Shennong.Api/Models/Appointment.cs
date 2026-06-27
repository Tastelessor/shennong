using System.ComponentModel.DataAnnotations;

namespace Shennong.Api.Models;

public class Appointment
{
    [Key]
    public string Id { get; set; } = string.Empty;
    
    public string? UserId { get; set; }
    
    public string? UserName { get; set; }
    
    public string? UserPhone { get; set; }
    
    public string? Date { get; set; }
    
    public string? Service { get; set; }
    
    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public string Status { get; set; } = "pending";
}
