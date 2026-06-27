using Microsoft.EntityFrameworkCore;
using Shennong.Api.Models;

namespace Shennong.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<User> Users => Set<User>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<Visitor> Visitors => Set<Visitor>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
        });
    }
}
