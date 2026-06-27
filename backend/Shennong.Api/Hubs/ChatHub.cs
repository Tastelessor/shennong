using Microsoft.AspNetCore.SignalR;
using Shennong.Api.Data;
using Shennong.Api.Models;

namespace Shennong.Api.Hubs;

public class ChatHub : Hub
{
    private readonly AppDbContext _context;
    
    public ChatHub(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task JoinRoom(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
    }
    
    public async Task LeaveRoom(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
    }
    
    public async Task SendMessage(string roomId, string senderName, string senderRole, string content)
    {
        var message = new ChatMessage
        {
            RoomId = roomId,
            SenderName = senderName,
            SenderRole = senderRole,
            Content = content,
            Timestamp = DateTime.UtcNow
        };
        
        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();
        
        await Clients.Group(roomId).SendAsync("ReceiveMessage", new
        {
            roomId,
            senderName,
            senderRole,
            content,
            timestamp = message.Timestamp
        });
    }
}
