using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shennong.Api.Data;
using Shennong.Api.DTOs;
using Shennong.Api.Models;
using Shennong.Api.Services;

namespace Shennong.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VisitorController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public VisitorController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string userId)
    {
        var visitors = await _context.Visitors
            .Where(v => v.UserId == userId)
            .ToListAsync();
        
        return Ok(visitors);
    }
    
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVisitorDto dto)
    {
        if (string.IsNullOrEmpty(dto.UserId) || string.IsNullOrEmpty(dto.Name) || string.IsNullOrEmpty(dto.Phone))
            return BadRequest(new { message = "Missing fields" });
        
        var existing = await _context.Visitors.FirstOrDefaultAsync(v =>
            v.UserId == dto.UserId && v.Name == dto.Name && v.Phone == dto.Phone);
        
        if (existing != null)
            return Ok(new { id = existing.Id, message = "Contact already exists" });
        
        var visitor = new Visitor
        {
            Id = IdGenerator.Generate(),
            UserId = dto.UserId,
            Name = dto.Name,
            Phone = dto.Phone
        };
        
        _context.Visitors.Add(visitor);
        await _context.SaveChangesAsync();
        
        return StatusCode(201, new { id = visitor.Id, message = "Contact saved" });
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var visitor = await _context.Visitors.FirstOrDefaultAsync(v => v.Id == id);
        if (visitor == null)
            return NotFound();
        
        _context.Visitors.Remove(visitor);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Deleted" });
    }
}
