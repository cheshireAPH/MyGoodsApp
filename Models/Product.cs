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

    [Column("series_id")]
    public int SeriesId { get; set; }

    [Column("category")]
    public string Category { get; set; } = string.Empty;

    [Column("is_template")]
    public bool IsTemplate { get; set; } = false;

}