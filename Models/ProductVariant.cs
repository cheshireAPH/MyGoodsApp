using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

[Table("product_variants")]
public class ProductVariant : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("product_id")]
    public Guid ProductId { get; set; }

    [Column("source_id")]
    public Guid SourceId { get; set; }

    [Column("name")]
    public string? Name { get; set; }

    [Column("order_index")]
    public int OrderIndex { get; set; }

    [Column("image_url")]
    public string? ImageUrl { get; set; }

    [Column("memo")]
    public string? Memo { get; set; }

    [Column("owned")]
    public int Owned { get; set; } = 0;

    [Column("wanted")]
    public int Wanted { get; set; } = 0;   // -1 = ∞

}

public class ProductVariantViewModel
{
    public Guid? Id { get; set; }
    public HashSet<int> CharacterIds { get; set; } = new();

    public string Name { get; set; } = "";
    public int OrderIndex { get; set; }
    public int Owned { get; set; }
    public int Wanted { get; set; }
}
