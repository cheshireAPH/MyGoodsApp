using MyGoodsApp.Models;

namespace MyGoodsApp.Services;

public class CharacterRepository
{
    private readonly SupabaseClientService _client;

    public CharacterRepository(SupabaseClientService client)
    {
        _client = client;
    }

    // ① シリーズごとのキャラ一覧取得
    public async Task<List<Character>> GetBySeries(int seriesId)
    {
        var result = await _client.Client
            .From<Character>()
            .Select("*")
            .Where(x => x.SeriesId == seriesId)
            .Order("order_index", Supabase.Postgrest.Constants.Ordering.Ascending)
            .Get();

        return result.Models;
    }

    // ② Upsert（追加・編集）
    public async Task<Character?> Upsert(Character character)
    {
        var result = await _client.Client
            .From<Character>()
            .Upsert(character);

        return result.Models.FirstOrDefault();
    }

    // ③ 削除
    public async Task Delete(int id)
    {
        await _client.Client
            .From<Character>()
            .Where(x => x.Id == id)
            .Delete();
    }

    // ④ 並び替え（order_index 更新）
    public async Task UpdateOrderIndex(int id, int newIndex)
    {
        var character = new Character
        {
            Id = id,
            OrderIndex = newIndex
        };

        await _client.Client
            .From<Character>()
            .Update(character);
    }
}
