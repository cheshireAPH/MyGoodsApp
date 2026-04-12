using System.Text.Json;
using System.Text.Json.Serialization;

namespace MyGoodsApp.Models
{
    public class DateOnlyJsonConverter : JsonConverter<DateOnly?>
    {
        public override DateOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.String &&
                DateOnly.TryParse(reader.GetString(), out var date))
            {
                return date;
            }
            return null;
        }

        public override void Write(Utf8JsonWriter writer, DateOnly? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
                writer.WriteStringValue(value.Value.ToString("yyyy-MM-dd"));
            else
                writer.WriteNullValue();
        }
    }
}
