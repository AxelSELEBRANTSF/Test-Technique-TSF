using CrudApp.Models;
using Microsoft.EntityFrameworkCore;

namespace CrudApp.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<Product> Products => Set<Product>();
    }
}
