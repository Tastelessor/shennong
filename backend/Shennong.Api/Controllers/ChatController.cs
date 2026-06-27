using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shennong.Api.Data;
using Shennong.Api.DTOs;

namespace Shennong.Api.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public ChatController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] string roomId)
    {
        var messages = await _context.ChatMessages
            .Where(m => m.RoomId == roomId)
            .OrderBy(m => m.Timestamp)
            .ToListAsync();
        
        return Ok(messages);
    }
    
    [HttpPost("read")]
    public async Task<IActionResult> MarkRead([FromBody] MarkReadDto dto)
    {
        var result = await _context.ChatMessages
            .Where(m => m.RoomId == dto.RoomId && m.SenderRole == "user")
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.IsRead, true));
        
        return Ok(new { message = "Marked as read", updated = result });
    }
}
