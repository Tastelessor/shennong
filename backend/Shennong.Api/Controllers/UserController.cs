using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shennong.Api.Data;
using Shennong.Api.DTOs;

namespace Shennong.Api.Controllers;

[ApiController]
[Route("api/user")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public UserController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet("profile/{id}")]
    public async Task<IActionResult> GetProfile(string id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return Ok(new { });
        
        return Ok(new
        {
            id = user.Id,
            name = user.Name,
            email = user.Email,
            role = user.Role,
            phone = user.Phone,
            inviterId = user.InviterId,
            partnerStatus = user.PartnerStatus,
            companyName = user.CompanyName
        });
    }
    
    [HttpPost("bind-inviter")]
    public async Task<IActionResult> BindInviter([FromBody] BindInviterDto dto)
    {
        if (dto.UserId == dto.InviterId)
            return BadRequest(new { message = "Cannot bind self" });
        
        var inviter = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.InviterId);
        if (inviter == null)
            return NotFound(new { message = "Inviter not found" });
        
        var directCount = await _context.Users.CountAsync(u => u.InviterId == dto.InviterId);
        if (directCount >= 2)
            return BadRequest(new { message = "Inviter full (max 2)" });
        
        var result = await _context.Users
            .Where(u => u.Id == dto.UserId && u.InviterId == null)
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.InviterId, dto.InviterId));
        
        if (result == 0)
            return BadRequest(new { message = "Bind failed or already bound" });
        
        return Ok(new { message = "Bound successfully" });
    }
    
    [HttpPost("update-password")]
    public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.UserId);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.Password))
            return BadRequest(new { message = "旧密码错误" });
        
        user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "密码修改成功" });
    }
    
    [HttpGet("invite-stats/{id}")]
    public async Task<IActionResult> GetInviteStats(string id)
    {
        var directs = await _context.Users.Where(u => u.InviterId == id).Select(u => u.Id).ToListAsync();
        if (!directs.Any())
            return Ok(new { teamACount = 0, teamBCount = 0 });
        
        async Task<int> GetTeamSize(string rootId)
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
            
            return 1 + team.Count;
        }
        
        var teamA = directs.Count > 0 ? await GetTeamSize(directs[0]) : 0;
        var teamB = directs.Count > 1 ? await GetTeamSize(directs[1]) : 0;
        
        return Ok(new { teamACount = teamA, teamBCount = teamB });
    }
}
