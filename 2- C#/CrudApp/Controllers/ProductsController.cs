using CrudApp.Data;
using CrudApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CrudApp.Controllers
{
    public class ProductsController(AppDbContext context) : Controller
    {
        public async Task<IActionResult> Index()
        {
            var products = await context.Products.AsNoTracking().ToListAsync();
            return View(products);
        }

        public async Task<IActionResult> Details(int? id)
        {
            if (id == null) return NotFound();
            var product = await context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return NotFound();
            return View(product);
        }

        public IActionResult Create() => View();

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Name,Price,Stock,Description")] Product product)
        {
            if (!ModelState.IsValid) return View(product);

            context.Add(product);
            await context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var product = await context.Products.FindAsync(id);
            if (product == null) return NotFound();
            return View(product);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Name,Price,Stock,Description")] Product product)
        {
            if (id != product.Id) return NotFound();
            if (!ModelState.IsValid) return View(product);

            try
            {
                context.Update(product);
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                var exists = await context.Products.AnyAsync(e => e.Id == id);
                if (!exists) return NotFound();
                throw;
            }

            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null) return NotFound();
            var product = await context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return NotFound();
            return View(product);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var product = await context.Products.FindAsync(id);
            if (product != null)
            {
                context.Products.Remove(product);
                await context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}
