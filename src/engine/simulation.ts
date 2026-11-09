import {
  config,
  events,
  initialState,
  markets,
  upgrades,
} from "../data/gameConfig";
import type {
  GameState,
  MarketId,
  UpgradeId,
  QuarterResult,
} from "../types/game";
export const round = (n: number) =>
  Math.round((n + Number.EPSILON) * 100) / 100;
export function lockedReason(state: GameState, id: MarketId): string | null {
  const m = markets[id];
  const reasons: string[] = [];
  if (state.quality < m.quality)
    reasons.push(`Chất lượng cần ${m.quality}/100 (hiện ${state.quality})`);
  if (id === "eu" && !state.upgrades.includes("traceability"))
    reasons.push("Cần hệ thống truy xuất nguồn gốc");
  return reasons.length ? reasons.join(" · ") : null;
}
export function purchase(state: GameState, id: UpgradeId): GameState {
  const u = upgrades.find((x) => x.id === id);
  if (!u) throw new Error("Khoản đầu tư không hợp lệ.");
  if (!state.started || state.quarter > 4 || state.failed)
    throw new Error("Phiên kinh doanh đã kết thúc hoặc chưa bắt đầu.");
  if (state.upgrades.includes(id))
    throw new Error("Khoản đầu tư đã được thực hiện.");
  if (state.cash < u.cost) throw new Error("Không đủ tiền mặt để đầu tư.");
  return {
    ...state,
    cash: round(state.cash - u.cost),
    equipment: state.equipment + (u.equipment ?? 0),
    capacity: state.capacity + (u.capacity ?? 0),
    quality: Math.min(100, state.quality + (u.quality ?? 0)),
    turnoverDays: state.turnoverDays - (u.days ?? 0),
    upgrades: [...state.upgrades, id],
    purchases: [
      ...state.purchases,
      { id, quarter: state.quarter, cost: u.cost, category: u.category },
    ],
  };
}
export function preview(state: GameState): QuarterResult {
  if (!state.started || state.quarter > 4 || state.failed)
    throw new Error("Không thể sản xuất ở trạng thái này.");
  const reason = lockedReason(state, state.market);
  if (reason) throw new Error(reason);
  const m = markets[state.market],
    event = events[state.quarter - 1],
    has = (id: UpgradeId) => state.upgrades.includes(id);
  const fixed = config.fixed + m.compliance,
    mandatory = config.wages + fixed;
  if (state.cash < mandatory)
    throw new Error(
      `Cần ít nhất ${mandatory} triệu đồng để chi trả lương và chi phí cố định. Hãy chọn thị trường ít chi phí hơn hoặc bắt đầu lại.`,
    );
  const logistics =
    config.logistics -
    (has("logistics") ? config.logisticsSaving : 0) +
    (has("logistics") ? event.mitigatedLogisticsDelta : event.logisticsDelta);
  const unit =
    config.rawMaterial -
    (has("cooperative") ? config.cooperativeSaving : 0) +
    config.processing -
    (has("dryer") ? config.dryerSaving : 0) +
    logistics +
    m.perTon;
  const demand =
    m.demand + (state.market !== "domestic" ? event.exportDemandBonus : 0);
  // Compare integer hundredths of a million to avoid losing a whole ton
  // through floating-point error when the available cash is exactly sufficient.
  const affordable = Math.max(
    0,
    Math.floor(
      (Math.round(state.cash * 100) - Math.round(mandatory * 100)) /
        Math.round(unit * 100),
    ),
  );
  const quantity = Math.min(state.capacity, demand, affordable);
  const revenue = round(
    quantity * (m.price + (state.market === "domestic" ? event.priceDelta : 0)),
  );
  const variableCost = round(quantity * unit);
  const depreciation = Math.min(
    state.equipment,
    round(
      config.depreciation +
        (state.equipment - config.initialEquipment) *
          config.upgradeDepreciationRate,
    ),
  );
  const purchases = state.purchases.filter((x) => x.quarter === state.quarter);
  const investments = purchases.reduce((sum, x) => sum + x.cost, 0),
    investmentExpenses = purchases
      .filter((x) => x.category === "expense")
      .reduce((sum, x) => sum + x.cost, 0);
  const operatingProfit = round(
    revenue - variableCost - mandatory - depreciation,
  );
  const turnoverDays =
    state.turnoverDays +
    (has("logistics") ? event.mitigatedDelay : event.delay);
  return {
    quarter: state.quarter,
    market: state.market,
    openingCash: round(state.cash + investments),
    investments,
    investmentExpenses,
    quantity,
    revenue,
    variableCost,
    wages: config.wages,
    fixedExpenses: fixed,
    depreciation,
    operatingProfit,
    profit: round(operatingProfit - investmentExpenses),
    endingCash: round(state.cash - variableCost - mandatory + revenue),
    capacity: state.capacity,
    quality: state.quality,
    turnoverDays,
    turnoverFrequency: round(config.yearDays / turnoverDays),
    equipment: state.equipment,
    event: event.name,
    warnings:
      quantity < Math.min(state.capacity, demand)
        ? ["Thiếu vốn lưu động: sản lượng tự động giảm."]
        : [],
  };
}
export function advance(state: GameState): GameState {
  const r = preview(state);
  return {
    ...state,
    cash: r.endingCash,
    quarter: state.quarter + 1,
    history: [...state.history, r],
  };
}
export function score(state: GameState) {
  const profit = state.history.reduce((a, x) => a + x.profit, 0),
    has = (id: UpgradeId) => state.upgrades.includes(id);
  const categories = [
    {
      name: "Hiệu quả tài chính",
      value: Math.min(30, Math.max(0, Math.floor(profit / 20))),
      max: 30,
      rule: "1 điểm / 20 triệu lợi nhuận lũy kế; tối đa 30.",
    },
    {
      name: "Năng suất & công nghệ",
      value:
        (has("dryer") ? 10 : 0) +
        (has("sorter") ? 10 : 0) +
        (has("traceability") ? 5 : 0),
      max: 25,
      rule: "Máy sấy 10; máy tách màu 10; truy xuất 5.",
    },
    {
      name: "Năng lực hội nhập",
      value: state.history.some((x) => x.market === "eu" && x.quantity > 0)
        ? 20
        : state.history.some((x) => x.market === "rcep" && x.quantity > 0)
          ? 12
          : 0,
      max: 20,
      rule: "Đã bán EU: 20; RCEP: 12; nội địa: 0.",
    },
    {
      name: "Dòng tiền & thanh khoản",
      value: Math.min(15, Math.max(0, Math.floor(state.cash / 70))),
      max: 15,
      rule: "1 điểm / 70 triệu tiền cuối kỳ; tối đa 15.",
    },
    {
      name: "Phát triển lao động",
      value: has("training") ? 10 : 0,
      max: 10,
      rule: "Hoàn thành đào tạo: 10 điểm.",
    },
  ];
  const total = categories.reduce((s, x) => s + x.value, 0);
  return {
    total,
    categories,
    grade:
      total < 40
        ? "Doanh nghiệp gặp khó khăn"
        : total < 60
          ? "Doanh nghiệp đang phát triển"
          : total < 80
            ? "Doanh nghiệp có năng lực cạnh tranh khá"
            : "Doanh nghiệp hội nhập thành công",
  };
}
export function scenarios() {
  let a = initialState("Kịch bản A"),
    b = initialState("Kịch bản B");
  for (let q = 1; q <= 4; q++) {
    a = advance(a);
    const plan: Record<number, UpgradeId[]> = {
      1: ["training", "traceability"],
      2: ["dryer", "sorter"],
      3: ["logistics", "cooperative"],
      4: [],
    };
    for (const id of plan[q]) b = purchase(b, id);
    b = {
      ...b,
      market: !lockedReason(b, "eu")
        ? "eu"
        : !lockedReason(b, "rcep")
          ? "rcep"
          : "domestic",
    };
    b = advance(b);
  }
  return { a, b };
}
