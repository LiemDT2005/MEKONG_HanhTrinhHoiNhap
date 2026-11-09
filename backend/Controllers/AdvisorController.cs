using Microsoft.AspNetCore.Mvc;
using Mekong.Api.Models;
using Mekong.Api.Services;
namespace Mekong.Api.Controllers;
[ApiController]
[Route("api/advisor")]
public sealed class AdvisorController(AIAdvisorService service) : ControllerBase
{
    [HttpPost("analyze")]
    public Task<AdvisorResponse> Analyze(AdvisorRequest request, CancellationToken ct) => service.Respond(request, false, ct);
    [HttpPost("chat")]
    public Task<AdvisorResponse> Chat(AdvisorRequest request, CancellationToken ct) => service.Respond(request, true, ct);
}
