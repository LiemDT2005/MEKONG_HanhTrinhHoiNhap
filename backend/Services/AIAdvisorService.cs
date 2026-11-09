using System.Text.Json;
using Mekong.Api.Models;
namespace Mekong.Api.Services;
public sealed class AIAdvisorService(HttpClient http, PromptBuilder prompts, ILogger<AIAdvisorService> logger)
{
    public async Task<AdvisorResponse> Respond(AdvisorRequest request, bool chat, CancellationToken ct)
    {
        if (request.State.ValueKind != JsonValueKind.Object || request.State.GetRawText().Length > 50000)
            return new("Trạng thái không hợp lệ hoặc quá lớn. Vui lòng tải lại trò chơi.", "demo");
        var key = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (string.IsNullOrWhiteSpace(key)) return Fallback(request);
        try
        {
            var model = Environment.GetEnvironmentVariable("GEMINI_MODEL") ?? "gemini-2.5-flash";
            using var message = new HttpRequestMessage(HttpMethod.Post, $"https://generativelanguage.googleapis.com/v1beta/models/{Uri.EscapeDataString(model)}:generateContent");
            message.Headers.Add("x-goog-api-key", key);
            message.Content = JsonContent.Create(new { systemInstruction = new { parts = new[] { new { text = prompts.SystemPrompt } } }, contents = new[] { new { role = "user", parts = new[] { new { text = prompts.Build(request, chat) } } } }, generationConfig = new { temperature = 0.3, maxOutputTokens = 1200 } });
            using var response = await http.SendAsync(message, ct);
            response.EnsureSuccessStatusCode();
            using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct));
            var parts = json.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts");
            var text = string.Join("\n", parts.EnumerateArray().Where(p => p.TryGetProperty("text", out _)).Select(p => p.GetProperty("text").GetString()));
            return string.IsNullOrWhiteSpace(text) ? Fallback(request) : new(text, "gemini");
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException or KeyNotFoundException or IndexOutOfRangeException or InvalidOperationException)
        {
            logger.LogWarning("Advisor unavailable: {ErrorType}", ex.GetType().Name);
            return Fallback(request);
        }
    }
    private static AdvisorResponse Fallback(AdvisorRequest request)
    {
        var q = request.Question?.ToLowerInvariant() ?? "";
        var text = q.Contains("thặng dư") || q.Contains("c/v")
            ? "Ví dụ lý luận giả định: c = 600, v = 200, m = 100 triệu đồng; c/v = 3 và m′ = 50%. Không lấy lợi nhuận kế toán trong game làm giá trị thặng dư, cũng không lấy giá máy chia lương quý để thay cấu tạo hữu cơ tư bản."
            : q.Contains("logistics") || q.Contains("chu chuyển")
            ? "Chu chuyển được minh họa bằng n = 360 / số ngày. Đầu tư logistics giảm chi phí và thời gian lưu thông, đồng thời giảm tác động của sự kiện quý 4. Trong MVP, số vòng là chỉ báo lý luận; không được nhân thẳng vào doanh thu."
            : "Hãy xem sản lượng thực tế và cảnh báo vốn lưu động trong dự toán trước khi đầu tư. Máy móc nâng năng lực nhưng có thể làm giảm tiền dành cho nguyên liệu. Đào tạo, truy xuất và chất lượng hỗ trợ tiếp cận thị trường. Tái sản xuất mở rộng cần cân đối đầu tư với khả năng vận hành; lợi nhuận kế toán không tự động bằng giá trị thặng dư.";
        return new(text + "\n\nGiải thích giáo dục có sẵn — chế độ dự phòng, không phải phản hồi AI trực tiếp. Mọi số liệu và điều kiện thị trường trong trò chơi đều giả định.", "demo");
    }
}
