import type { GameState } from "../types/game";
import { markets, upgrades } from "../data/gameConfig";
import { chapters } from "../data/chapters";
export function isValidSave(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const s = value as GameState;
  if (
    typeof s.playerName !== "string" ||
    typeof s.companyName !== "string" ||
    typeof s.started !== "boolean" ||
    typeof s.failed !== "boolean"
  )
    return false;
  if (
    !Number.isInteger(s.quarter) ||
    s.quarter < 1 ||
    s.quarter > 5 ||
    !Object.hasOwn(markets, s.market)
  )
    return false;
  if (
    ![s.cash, s.equipment, s.capacity, s.quality, s.turnoverDays].every(
      (n) => Number.isFinite(n) && n >= 0,
    ) ||
    s.quality > 100 ||
    s.turnoverDays === 0
  )
    return false;
  if (
    !Array.isArray(s.history) ||
    s.history.length !== s.quarter - 1 ||
    !Array.isArray(s.purchases) ||
    !Array.isArray(s.upgrades)
  )
    return false;
  if (
    new Set(s.upgrades).size !== s.upgrades.length ||
    s.upgrades.some((id) => !upgrades.some((u) => u.id === id))
  )
    return false;
  if (
    s.purchases.length !== s.upgrades.length ||
    s.purchases.some(
      (p) =>
        !p ||
        !s.upgrades.includes(p.id) ||
        !Number.isInteger(p.quarter) ||
        p.quarter < 1 ||
        p.quarter > Math.min(4, s.quarter) ||
        !upgrades.some(
          (u) =>
            u.id === p.id && u.cost === p.cost && u.category === p.category,
        ),
    )
  )
    return false;
  const numericFields = [
    "openingCash",
    "investments",
    "investmentExpenses",
    "quantity",
    "revenue",
    "variableCost",
    "wages",
    "fixedExpenses",
    "depreciation",
    "operatingProfit",
    "profit",
    "endingCash",
    "capacity",
    "quality",
    "turnoverDays",
    "turnoverFrequency",
    "equipment",
  ] as const;
  if (
    s.decisions !== undefined &&
    (!Array.isArray(s.decisions) ||
      new Set(s.decisions.map((d) => d?.chapter)).size !== s.decisions.length ||
      s.decisions.some(
        (d) =>
          !d ||
          !Number.isInteger(d.chapter) ||
          d.chapter < 1 ||
          d.chapter > Math.min(4, s.quarter) ||
          !chapters[d.chapter - 1].choices.some((c) => c.id === d.choice) ||
          ![d.cashBefore, d.cashAfter].every(
            (n) => Number.isFinite(n) && n >= 0,
          ) ||
          !d.forecast ||
          d.forecast.quarter !== d.chapter ||
          !Object.hasOwn(markets, d.forecast.market) ||
          !numericFields.every(
            (k) =>
              typeof d.forecast[k] === "number" &&
              Number.isFinite(d.forecast[k]),
          ),
      ))
  )
    return false;
  return s.history.every(
    (r, i) =>
      r &&
      r.quarter === i + 1 &&
      Object.hasOwn(markets, r.market) &&
      typeof r.event === "string" &&
      Array.isArray(r.warnings) &&
      r.warnings.every((w) => typeof w === "string") &&
      numericFields.every(
        (k) => typeof r[k] === "number" && Number.isFinite(r[k]),
      ) &&
      r.endingCash >= 0,
  );
}
