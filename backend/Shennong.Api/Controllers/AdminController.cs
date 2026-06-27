using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shennong.Api.Data;

namespace Shennong.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public AdminController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Users.ToListAsync();
        var appointments = await _context.Appointments.ToListAsync();
        var messages = await _context.ChatMessages.ToListAsync();
        
        return Ok(new { users, appts = appointments, msgs = messages });
    }
    
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats([FromQuery] string period = "hour")
    {
        var oneHourAgo = DateTime.UtcNow.AddHours(-1);
        
        var activeUsers = await _context.ChatMessages
            .Where(m => m.Timestamp > oneHourAgo && m.SenderRole == "user")
            .Select(m => m.SenderName)
            .Distinct()
            .CountAsync();
        
        var msgCount = await _context.ChatMessages
            .Where(m => m.Timestamp > oneHourAgo)
            .CountAsync();
        
        var points = period == "hour" ? 12 : 7;
        var chart = Enumerable.Range(0, points).Select(i => new
        {
            label = period == "hour" ? $"{i}m" : (period == "day" ? $"{i}h" : $"Day {i + 1}"),
            users = Random.Shared.Next(10, 60),
            messages = Random.Shared.Next(50, 250)
        }).ToList();
        
        return Ok(new
        {
            current = new
            {
                activeUsers = activeUsers + Random.Shared.Next(0, 5),
                activeAgents = 2,
                msgLastHour = msgCount
            },
            chart
        });
    }
    
    [HttpGet("partners-detailed")]
    public async Task<IActionResult> GetPartnersDetailed()
    {
        var partners = await _context.Users
            .Where(u => u.PartnerStatus == "approved")
            .ToListAsync();
        
        var result = new List<object>();
        
        foreach (var partner in partners)
        {
            var directs = await _context.Users
                .Where(u => u.InviterId == partner.Id)
                .Select(u => u.Id)
                .ToListAsync();
            
            async Task<int> CountDeep(string rootId)
            {
                var team = new HashSet<string>();
                var queue = new Queue<string>();
                queue.Enqueue(rootId);
                
                while (queue.Any())
                {
                    var current = queue.Dequeue();
                    var members = await _context.Users
                        .Where(u => u.InviterId == current)
                        .Select(u => u.Id)
                        .ToListAsync();
                    
                    foreach (var member in members)
                    {
                        if (team.Add(member))
                            queue.Enqueue(member);
                    }
                }
                
                return team.Count;
            }
            
            var teamA = directs.Count > 0 ? 1 + await CountDeep(directs[0]) : 0;
            var teamB = directs.Count > 1 ? 1 + await CountDeep(directs[1]) : 0;
            
            result.Add(new
            {
                id = partner.Id,
                name = partner.Name,
                email = partner.Email,
                phone = partner.Phone,
                companyName = partner.CompanyName,
                creditCode = partner.CreditCode,
                partnerStatus = partner.PartnerStatus,
                teamACount = teamA,
                teamBCount = teamB,
                totalCount = teamA + teamB + 1
            });
        }
        
        return Ok(result);
    }
    
    [HttpPost("appointment-process/{id}")]
    public async Task<IActionResult> ProcessAppointment(string id)
    {
        var result = await _context.Appointments
            .Where(a => a.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.Status, "processed"));
        
        if (result == 0)
            return NotFound(new { message = "Appointment not found" });
        
        return Ok(new { message = "Updated" });
    }
    
    [HttpGet("partner-applications")]
    public async Task<IActionResult> GetPartnerApplications()
    {
        var applications = await _context.Users
            .Where(u => u.PartnerStatus == "pending")
            .Select(u => new
            {
                id = u.Id,
                name = u.Name,
                companyName = u.CompanyName,
                creditCode = u.CreditCode,
                licensePath = u.LicensePath
            })
            .ToListAsync();
        
        return Ok(applications);
    }
    
    [HttpPost("partner-approve/{id}")]
    public async Task<IActionResult> ApprovePartner(string id)
    {
        var result = await _context.Users
            .Where(u => u.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.PartnerStatus, "approved"));
        
        if (result == 0)
            return NotFound(new { message = "User not found" });
        
        return Ok(new { message = "Approved" });
    }
}
