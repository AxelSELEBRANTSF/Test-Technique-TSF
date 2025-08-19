using CrudApp.Data;
using CrudApp.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

// Connexion SQL Server : priorité à la variable d'env, sinon appsettings.json
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["ConnectionStrings:DefaultConnection"]
    ?? "Server=localhost,1433;Database=CrudAppDb;User Id=sa;Password=Your_strong_password123;TrustServerCertificate=True;";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

var app = builder.Build();

// Crée la base au démarrage et seed minimal
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Products.Any())
    {
        db.Products.AddRange(
        [
            new Product { Name = "Keyboard", Price = 49.99m, Stock = 25, Description = "Mechanical keyboard" },
            new Product { Name = "Mouse", Price = 19.99m, Stock = 100, Description = "Optical mouse" },
            new Product { Name = "Monitor", Price = 199.99m, Stock = 10, Description = "24-inch display" }
        ]);
        db.SaveChanges();
    }
}

// Pipeline HTTP
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthorization();

// Route par défaut vers Products
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Products}/{action=Index}/{id?}");

app.Run();