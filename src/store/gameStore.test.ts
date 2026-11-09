import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { advance, purchase } from "../engine/simulation";
import { initialState } from "../data/gameConfig";
import { fallback } from "../services/advisorApi";

const memory = new Map<string, string>();
let useGame: typeof import("./gameStore").useGame;
beforeAll(async () => {
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
    removeItem: (key: string) => memory.delete(key),
  });
  useGame = (await import("./gameStore")).useGame;
});
beforeEach(() => useGame.getState().start("CEO", "Test Rice"));
afterAll(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("chapter game integration", () => {
  it("blocks skipped missions and double operation; persists and restores decisions", async () => {
    expect(() => useGame.getState().run()).toThrow();
    useGame.getState().choose("people");
    expect(useGame.getState().advicePending).toBe(true);
    useGame.getState().closeAdvice();
    useGame.getState().run();
    expect(useGame.getState().game.quarter).toBe(2);
    expect(() => useGame.getState().run()).toThrow();
    const saved = JSON.parse(memory.get("mekong-simulator-v1")!);
    expect(saved.state.game.decisions[0].choice).toBe("people");
    expect(saved.state.advicePending).toBeUndefined();
    useGame.setState({ game: initialState() });
    memory.set("mekong-simulator-v1", JSON.stringify(saved));
    await useGame.persist.rehydrate();
    expect(useGame.getState().game.quarter).toBe(2);
    expect(useGame.getState().game.history).toHaveLength(1);
  });
  it("restores an old save without inventing historical decisions", async () => {
    const { decisions: _decisions, ...legacy } = advance(
      initialState("Old CEO"),
    );
    memory.set(
      "mekong-simulator-v1",
      JSON.stringify({ version: 1, state: { game: legacy } }),
    );
    await useGame.persist.rehydrate();
    expect(useGame.getState().game.history).toEqual(legacy.history);
    expect(useGame.getState().game.decisions).toBeUndefined();
    useGame.getState().choose("trace");
    useGame.getState().run();
    expect(useGame.getState().game.history).toHaveLength(2);
  });
  it("opens advisor feedback for investments and actual market changes", () => {
    useGame.getState().buy("traceability");
    expect(useGame.getState().advicePending).toBe(true);
    useGame.getState().closeAdvice();
    useGame.getState().selectMarket("rcep");
    expect(useGame.getState().game.market).toBe("rcep");
    expect(useGame.getState().advicePending).toBe(true);
    const text = fallback(useGame.getState().game).message;
    for (const heading of [
      "Hệ quả tài chính và vận hành:",
      "Liên hệ lý luận:",
      "Câu hỏi phản biện:",
      "Gợi ý thực hành:",
    ])
      expect(text).toContain(heading);
  });
  it("renders illustrated missions over the existing interactive world", async () => {
    const { GameWorld } = await import("../components/world/GameWorld");
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(GameWorld)),
    );
    expect(html).toContain("Doanh nghiệp nhỏ bên dòng Mekong");
    expect(html).toContain("Chọn chiến lược");
    expect(html).toContain("Giữ quy mô, tạo nguồn tích lũy");
    expect(html).toContain("Khám phá Nhà máy chế biến");
    expect(html).toContain("700");
    const { BusinessMap } = await import("../components/world/BusinessMap");
    const { ChapterArt } = await import("../components/world/ChapterMission");
    const game = advance(advance(initialState("CEO")));
    const third = renderToStaticMarkup(
      createElement(BusinessMap, { game, selected: null, onSelect: () => {} }),
    );
    expect(third).toContain("ÙN TẮC CẢNG");
    expect(
      renderToStaticMarkup(createElement(ChapterArt, { chapter: 3 })),
    ).toContain("Đoàn xe chờ tàu tại cảng");
    const improved = renderToStaticMarkup(
      createElement(BusinessMap, {
        game: purchase(game, "logistics"),
        selected: null,
        onSelect: () => {},
      }),
    );
    expect(improved).toContain("LUỒNG HÀNG ĐƯỢC ĐIỀU PHỐI");
  });
  it("renders durable chapter reports and the balanced final win condition", async () => {
    for (const id of ["people", "trace", "route", "regional"]) {
      useGame.getState().choose(id);
      useGame.getState().run();
    }
    const { EducationalReport } =
      await import("../components/world/ChapterMission");
    const html = renderToStaticMarkup(
      createElement(EducationalReport, { game: useGame.getState().game }),
    );
    for (const text of [
      "Chiến thắng",
      "Vấn đề ban đầu:",
      "Quyết định:",
      "Kết quả thực tế:",
      "Lý luận:",
      "Bài học:",
      "Rút ngắn chu chuyển",
      "quy tắc xuất xứ",
    ])
      expect(html).toContain(text);
    expect(html).toContain("Vươn ra thị trường quốc tế");
  });
});
