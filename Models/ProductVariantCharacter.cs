using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

[Table("product_variant_characters")]
public class ProductVariantCharacter : BaseModel
{
    [PrimaryKey("product_variant_id")]
    [Column("product_variant_id")]
    public Guid ProductVariantId { get; set; }

    [PrimaryKey("character_id")]
    [Column("character_id")]
    public int CharacterId { get; set; }
}
