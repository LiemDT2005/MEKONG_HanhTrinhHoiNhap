using Mekong.Api.Services;
var builder = WebApplication.CreateBuilder(args);
var port = builder.Configuration["PORT"];
if (!string.IsNullOrWhiteSpace(port))
{
    if (!int.TryParse(port, out var parsedPort) || parsedPort < 1 || parsedPort > 65535)
        throw new InvalidOperationException("PORT must be an integer between 1 and 65535.");
    builder.WebHost.UseUrls($"http://0.0.0.0:{parsedPort}");
}
else
{
    builder.WebHost.UseUrls(builder.Configuration["ASPNETCORE_URLS"] ?? "http://127.0.0.1:5080");
}
var frontendOrigins = (builder.Configuration["FRONTEND_ORIGINS"]
    ?? "http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:4173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Select(origin => origin.TrimEnd('/'))
    .ToArray();
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins(frontendOrigins)
    .AllowAnyHeader()
    .AllowAnyMethod()));
builder.Services.AddHttpClient<AIAdvisorService>(client => client.Timeout = TimeSpan.FromSeconds(18));
builder.Services.AddSingleton<PromptBuilder>();
var app = builder.Build();
app.UseCors();
app.MapOpenApi();
app.MapControllers();
app.MapGet("/api/health", () => new { status = "ok", mode = string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("GEMINI_API_KEY")) ? "demo" : "gemini" });
app.Run();
