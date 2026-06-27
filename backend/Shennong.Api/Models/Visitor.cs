using System.ComponentModel.DataAnnotations;

namespace Shennong.Api.Models;

public class Visitor
{
    [Key]
    public string Id { get; set; } = string.Empty;
    
    public string? UserId { get; set; }
    
    public string? Name { get; set; }
    
    public string? Phone { get; set; }
}
