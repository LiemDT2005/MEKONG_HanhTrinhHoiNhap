import { chapters } from "../data/chapters";
import { config } from "../data/gameConfig";
import { lockedReason, preview, purchase } from "./simulation";
import type { GameState, QuarterResult } from "../types/game";

export function chooseChapter(state: GameState, id: string): GameState {
  if (!state.started || state.failed || state.quarter > 4)
    throw new Error("Hành trình chưa bắt đầu hoặc đã kết thúc.");
  if (state.decisions?.some((d) => d.chapter === state.quarter))
    throw new Error("Chương này đã có quyết định chiến lược.");
  const choice = chapters[state.quarter - 1].choices.find((c) => c.id === id);
  if (!choice) throw new Error("Lựa chọn không hợp lệ.");
  let next = state;
  for (const id of choice.upgrades)
    if (!next.upgrades.includes(id)) next = purchase(next, id);
  if (choice.market) {
    const reason = lockedReason(next, choice.market);
    if (reason) throw new Error(reason);
    next = { ...next, market: choice.market };
  }
  const forecast = preview(next);
  if (!forecast.quantity)
    throw new Error("Cần giữ đủ vốn để sản xuất ít nhất một tấn.");
  return {
    ...next,
    decisions: [
      ...(state.decisions ?? []),
      {
        chapter: state.quarter,
        choice: id,
        cashBefore: state.cash,
        cashAfter: next.cash,
        forecast,
      },
    ],
  };
}
export function chapterAchieved(r: QuarterResult) {
  return [
    r.quantity >= 30 && r.endingCash >= 700,
    r.quality >= 60 && r.quantity >= 25,
    r.turnoverDays <= 60 && r.operatingProfit > 0,
    r.market !== "domestic" &&
      r.quantity > 0 &&
      r.operatingProfit > 0 &&
      r.endingCash >= 300,
  ][r.quarter - 1];
}
export function competitiveness(s: GameState) {
  const last = s.history.at(-1);
  const assets =
    Math.round(
      (s.cash +
        s.equipment -
        s.history.reduce((sum, r) => sum + r.depreciation, 0)) *
        100,
    ) / 100;
  const checks = [
    {
      name: "Tích lũy và thanh khoản",
      done:
        assets > config.initialCash + config.initialEquipment && s.cash >= 300,
      detail: `Tài sản ròng sau khấu hao ${assets} so với 1.000 triệu ban đầu; dự trữ ≥300 triệu.`,
    },
    {
      name: "Công nghệ có hiệu quả",
      done:
        s.upgrades.some((x) =>
          ["dryer", "sorter", "traceability"].includes(x),
        ) &&
        !!last &&
        last.operatingProfit > 0 &&
        last.quantity >= 30,
      detail:
        "Có đổi mới kỹ thuật, bán ≥30 tấn và lãi hoạt động ở chương cuối.",
    },
    {
      name: "Phát triển lao động",
      done: s.upgrades.includes("training"),
      detail: "Đã đào tạo lao động; không chỉ mua thiết bị.",
    },
    {
      name: "Rút ngắn chu chuyển",
      done: !!last && last.turnoverDays < config.turnoverDays,
      detail: `Chu kỳ cuối ${last?.turnoverDays ?? s.turnoverDays} ngày so với 60 ngày ban đầu.`,
    },
    {
      name: "Cạnh tranh quốc tế",
      done:
        !!last &&
        last.market !== "domestic" &&
        last.quantity > 0 &&
        last.operatingProfit > 0,
      detail: "Đơn hàng quốc tế cuối hành trình có lãi hoạt động.",
    },
  ];
  return { checks, won: s.quarter > 4 && checks.every((c) => c.done) };
}
