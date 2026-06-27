using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shennong.Api.Data;
using Shennong.Api.DTOs;

namespace Shennong.Api.Controllers;

[ApiController]
[Route("api/partner")]
public class PartnerController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;
    
    public PartnerController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }
    
    [HttpPost("apply")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Apply([FromForm] PartnerApplyDto dto, IFormFile? license)
    {
        string? licensePath = null;
        
        if (license != null && license.Length > 0)
        {
            var uploadsDir = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "uploads");
            Directory.CreateDirectory(uploadsDir);
            
            var fileName = $"{DateTime.UtcNow.Ticks}-{license.FileName}";
            var filePath = Path.Combine(uploadsDir, fileName);
            
            using var stream = new FileStream(filePath, FileMode.Create);
            await license.CopyToAsync(stream);
            
            licensePath = $"/uploads/{fileName}";
        }
        
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.UserId);
        if (user == null)
            return NotFound(new { message = "User not found" });
        
        user.PartnerStatus = "pending";
        user.CompanyName = dto.CompanyName;
        user.CreditCode = dto.CreditCode;
        user.LicensePath = licensePath;
        
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Applied" });
    }
    
    [HttpPost("revoke/{id}")]
    public async Task<IActionResult> Revoke(string id)
    {
        // Free downlines
        await _context.Users
            .Where(u => u.InviterId == id)
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.InviterId, (string?)null));
        
        // Free upline quota
        await _context.Users
            .Where(u => u.Id == id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(u => u.InviterId, (string?)null)
                .SetProperty(u => u.PartnerStatus, "none")
                .SetProperty(u => u.Role, "user")
                .SetProperty(u => u.CompanyName, (string?)null)
                .SetProperty(u => u.CreditCode, (string?)null)
                .SetProperty(u => u.LicensePath, (string?)null));
        
        return Ok(new { message = "Partner revoked, downlines unbound, upline quota freed." });
    }
    
    [HttpGet("tree/{id}")]
    public async Task<IActionResult> GetTree(string id)
    {
        async Task<object?> BuildTree(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return null;
            
            var children = await _context.Users
                .Where(u => u.InviterId == userId)
                .Select(u => u.Id)
                .ToListAsync();
            
            var childNodes = new List<object>();
            foreach (var childId in children)
            {
                var node = await BuildTree(childId);
                if (node != null)
                    childNodes.Add(node);
            }
            
            return new
            {
                name = user.Name,
                id = user.Id,
                children = childNodes
            };
        }
        
        var tree = await BuildTree(id);
        return Ok(tree);
    }
}
