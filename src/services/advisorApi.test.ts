import { afterEach, describe, it, expect, vi } from "vitest";
import { initialState } from "../data/gameConfig";
import { askAdvisor } from "./advisorApi";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("advisor failure boundary", () => {
  it("keeps all four educational sections when the server uses demo mode", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ mode: "demo", message: "Generic old fallback" }),
      }),
    );
    const result = await askAdvisor(initialState("CEO"));
    for (const heading of [
      "Hệ quả tài chính và vận hành:",
      "Liên hệ lý luận:",
      "Câu hỏi phản biện:",
      "Gợi ý thực hành:",
    ])
      expect(result.message).toContain(heading);
    expect(result.message).toContain("35/40 tấn");
    expect(result.mode).toBe("demo");
  });
  it("uses the configured production API origin without doubled slashes", async () => {
    vi.stubEnv("VITE_API_BASE_URL", " https://mekong-api.example/// ");
    const mock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ mode: "demo", message: "Nội dung giáo dục." }),
    });
    vi.stubGlobal("fetch", mock);
    await askAdvisor(initialState("CEO"), "Chu chuyển");
    expect(mock.mock.calls[0][0]).toBe(
      "https://mekong-api.example/api/advisor/chat",
    );
  });
  it("keeps the game state intact when the API is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const state = initialState("CEO"),
      before = JSON.stringify(state);
    const response = await askAdvisor(state, "Giá trị thặng dư");
    expect(response.mode).toBe("demo");
    expect(response.message).toContain("không tự động bằng m");
    expect(JSON.stringify(state)).toBe(before);
  });
  it("includes deterministic context and rejects invalid server responses", async () => {
    const mock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ mode: "unknown", message: 10 }),
    });
    vi.stubGlobal("fetch", mock);
    const result = await askAdvisor(initialState("CEO"));
    const sent = JSON.parse(mock.mock.calls[0][1].body);
    expect(sent.state.currentEvent.name).toBeTruthy();
    expect(sent.state.scenarioComparison.b.history).toHaveLength(4);
    expect(sent.state.projection.quantity).toBe(35);
    expect(result.mode).toBe("demo");
  });
  it("labels an actual successful Gemini response as live", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          mode: "gemini",
          message: "Phân tích giáo dục.",
        }),
      }),
    );
    expect(await askAdvisor(initialState("CEO"))).toEqual({
      mode: "gemini",
      message: "Phân tích giáo dục.",
    });
  });
});
