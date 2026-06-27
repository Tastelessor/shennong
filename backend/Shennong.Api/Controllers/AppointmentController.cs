using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shennong.Api.Data;
using Shennong.Api.DTOs;
using Shennong.Api.Models;
using Shennong.Api.Services;

namespace Shennong.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public AppointmentController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
    {
        var appointment = new Appointment
        {
            Id = IdGenerator.Generate(),
            UserId = dto.UserId ?? "GUEST",
            UserName = dto.UserName,
            UserPhone = dto.UserPhone,
            Date = dto.Date,
            Service = dto.Service,
            Description = dto.Description,
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        
        return StatusCode(201, new { message = "Appointment created" });
    }
    
    [HttpGet]
    public async Task<IActionResult> GetHistory([FromQuery] string userId)
    {
        var appointments = await _context.Appointments
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
        
        return Ok(appointments);
    }
}
