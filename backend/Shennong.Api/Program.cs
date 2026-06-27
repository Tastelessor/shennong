using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Shennong.Api.Data;
using Shennong.Api.Hubs;
using Shennong.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

// Services
builder.Services.AddScoped<JwtService>();

// Controllers & SignalR
builder.Services.AddControllers();
builder.Services.AddSignalR();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
    
    options.AddPolicy("SignalR", policy =>
    {
        policy.AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .SetIsOriginAllowed(_ => true);
    });
});

var app = builder.Build();

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();
    
    // Seed admin and agent
    if (!context.Users.Any(u => u.Email == "admin@shennong.com"))
    {
        context.Users.Add(new Shennong.Api.Models.User
        {
            Id = "admin_001",
            Email = "admin@shennong.com",
            Phone = "0000",
            Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Name = "System Admin",
            Role = "admin"
        });
    }
    
    if (!context.Users.Any(u => u.Email == "agent@shennong.com"))
    {
        context.Users.Add(new Shennong.Api.Models.User
        {
            Id = "agent_001",
            Email = "agent@shennong.com",
            Phone = "1111",
            Password = BCrypt.Net.BCrypt.HashPassword("agent123"),
            Name = "Online Agent 01",
            Role = "agent"
        });
    }
    
    context.SaveChanges();
}

app.UseCors();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<ChatHub>("/chatHub").RequireCors("SignalR");

app.Run();
