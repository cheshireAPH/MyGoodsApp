using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace MyGoodsApp.Models;

[Table("products")]
public class Product : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("series")]
    public string Series { get; set; } = string.Empty;

    [Column("category")]
    public string Category { get; set; } = string.Empty;
}