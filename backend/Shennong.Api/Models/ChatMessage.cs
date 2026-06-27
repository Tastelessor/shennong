using System.ComponentModel.DataAnnotations;

namespace Shennong.Api.Models;

public class ChatMessage
{
    [Key]
    public int Id { get; set; }
    
    public string? RoomId { get; set; }
    
    public string? SenderName { get; set; }
    
    public string? SenderRole { get; set; }
    
    public string? Content { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public bool IsRead { get; set; } = false;
}
