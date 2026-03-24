using Supabase;

namespace MyGoodsApp
{
    public class SupabaseClientService
    {
        public Client Client { get; }

        public SupabaseClientService(string url, string key)
        {
            Client = new Client(url, key, new SupabaseOptions
            {
                AutoConnectRealtime = false
            });
        }
    }
}
