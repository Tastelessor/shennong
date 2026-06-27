using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shennong.Api.Data;

namespace Shennong.Api.Controllers;

[ApiController]
[Route("api/agent")]
public class AgentController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public AgentController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions()
    {
        var sessions = await _context.ChatMessages
            .GroupBy(m => m.RoomId)
            .Select(g => new
            {
                roomId = g.Key,
                senderName = g.OrderByDescending(m => m.Timestamp).First().SenderName,
                content = g.OrderByDescending(m => m.Timestamp).First().Content,
                lastMsgTime = g.Max(m => m.Timestamp),
                unreadCount = g.Count(m => m.SenderRole == "user" && !m.IsRead)
            })
            .OrderByDescending(s => s.lastMsgTime)
            .ToListAsync();
        
        return Ok(sessions);
    }
}
