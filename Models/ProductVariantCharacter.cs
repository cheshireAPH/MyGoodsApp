using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace MyGoodsApp.Models
{
    [Table("product_variant_characters")]
    public class ProductVariantCharacter : BaseModel
    {
        [Column("product_variant_id")]
        public Guid ProductVariantId { get; set; }

        [Column("character_id")]
        public int CharacterId { get; set; }
    }
}
