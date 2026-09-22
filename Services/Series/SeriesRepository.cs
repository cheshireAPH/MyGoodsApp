using MyGoodsApp.Models;

namespace MyGoodsApp.Services;

public class SeriesRepository
{
    private readonly SupabaseClientService _client;

    public SeriesRepository(SupabaseClientService client)
    {
        _client = client;
    }

    // ① 全作品取得
    public async Task<List<Series>> GetAll()
    {
        var result = await _client.Client
            .From<Series>()
            .Select("*")
            .Order("name", Supabase.Postgrest.Constants.Ordering.Ascending)
            .Get();

        return result.Models;
    }

    // ② Upsert（追加・編集）
    public async Task<Series?> Upsert(Series series)
    {
        var result = await _client.Client
            .From<Series>()
            .Upsert(series);

        return result.Models.FirstOrDefault();
    }

    // ③ 削除
    public async Task Delete(int id)
    {
        var s = new Series { Id = id };

        await _client.Client
            .From<Series>()
            .Delete(s);
    }
}
