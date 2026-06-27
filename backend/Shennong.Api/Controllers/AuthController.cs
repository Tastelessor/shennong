using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shennong.Api.Data;
using Shennong.Api.DTOs;
using Shennong.Api.Models;
using Shennong.Api.Services;

namespace Shennong.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwt;
    
    public AuthController(AppDbContext context, JwtService jwt)
    {
        _context = context;
        _jwt = jwt;
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email registered" });
        
        var user = new User
        {
            Id = IdGenerator.Generate(),
            Email = dto.Email,
            Phone = dto.Phone,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Name = dto.Name,
            Role = "user"
        };
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        return StatusCode(201, new AuthResponseDto(user.Id, user.Email, user.Name, user.Role));
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            return Unauthorized(new { message = "Invalid credentials" });
        
        var token = _jwt.GenerateToken(user.Id, user.Email, user.Role);
        
        return Ok(new
        {
            message = "Login success",
            token,
            user = new AuthResponseDto(user.Id, user.Email, user.Name, user.Role)
        });
    }
    
    [HttpGet("verify")]
    public async Task<IActionResult> Verify([FromQuery] string id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return Unauthorized(new { message = "Unauthorized" });
        
        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            name = user.Name,
            role = user.Role,
            phone = user.Phone,
            inviterId = user.InviterId,
            partnerStatus = user.PartnerStatus
        });
    }
}
