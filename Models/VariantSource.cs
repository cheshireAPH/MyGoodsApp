using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

[Table("variant_sources")]
public class VariantSource : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("product_id")]
    public Guid ProductId { get; set; }

    [Column("name")]
    public string? Name { get; set; }

    [Column("order_index")]
    public int OrderIndex { get; set; }

    [Column("url")]
    public string? Url { get; set; }

    [Column("barcode")]
    public string? Barcode { get; set; }
}

public class VariantSourceViewModel
{
    public VariantSource Source { get; set; }
    public List<ProductVariantViewModel> Variants { get; set; }

    public VariantSourceViewModel()
    {
        Source = new VariantSource();
        Variants = new List<ProductVariantViewModel>();
    }
}
