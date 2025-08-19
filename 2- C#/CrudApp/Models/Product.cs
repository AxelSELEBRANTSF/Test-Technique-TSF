using System.ComponentModel.DataAnnotations;

namespace CrudApp.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required, StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Range(0, 1_000_000)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        [StringLength(200)]
        public string? Description { get; set; }
    }
}
