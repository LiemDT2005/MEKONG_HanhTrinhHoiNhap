using System.ComponentModel.DataAnnotations;
using System.Text.Json;
namespace Mekong.Api.Models;
public sealed record AdvisorRequest
{
    [MaxLength(2000)] public string? Question { get; init; }
    [Required] public JsonElement State { get; init; }
}
public sealed record AdvisorResponse(string Message, string Mode);
