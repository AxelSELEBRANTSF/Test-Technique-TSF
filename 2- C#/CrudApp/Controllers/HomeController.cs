using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CrudApp.Models;

namespace CrudApp.Controllers;

public class HomeController() : Controller
{
    public IActionResult Index() => RedirectToAction("Index", "Products");

    public IActionResult Privacy() => View();

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error() => View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
}
