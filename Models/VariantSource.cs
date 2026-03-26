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

    [Column("url")]
    public string? Url { get; set; }

    [Column("barcode")]
    public string? Barcode { get; set; }

    // 画面用：封入品をネストして扱うためのローカルプロパティ
    public List<ProductVariant> Variants { get; set; } = new();
}