using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace MyGoodsApp.Models;

[Table("characters")]
public class Character : BaseModel
{
    [PrimaryKey("id", false)]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("series_id")]
    public int SeriesId { get; set; }
}
