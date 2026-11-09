import { describe, it, expect } from "vitest";
import { initialState, upgrades } from "../data/gameConfig";
import {
  advance,
  lockedReason,
  preview,
  purchase,
  scenarios,
  score,
} from "./simulation";
const initial = () => initialState("Người chơi");
describe("quarterly financial engine", () => {
  it("uses exact cash affordability at fractional unit-cost boundaries", () => {
    const s = purchase(initial(), "dryer");
    for (let n = 1; n <= 50; n++) {
      expect(
        preview({ ...s, cash: Math.round((110 + n * 16.3) * 100) / 100 })
          .quantity,
      ).toBe(n);
    }
  });
  it("requires a real export sale before awarding market points", () => {
    const s = purchase(purchase(initial(), "sorter"), "traceability");
    const trained = purchase(s, "training");
    const finished = advance({ ...trained, cash: 135, market: "eu" });
    expect(finished.history[0].quantity).toBe(0);
    expect(score(finished).categories.find((c) => c.max === 20)?.value).toBe(0);
  });
  it("uses correct initial assets and cash", () => {
    const s = initial();
    expect(s.cash + s.equipment).toBe(1000);
    expect(s.capacity).toBe(40);
    expect(s.quality).toBe(50);
  });
  it("calculates affordable production and exact cash reconciliation", () => {
    const r = preview(initial());
    expect(r.quantity).toBe(35);
    expect(r.revenue).toBe(770);
    expect(r.variableCost).toBe(577.5);
    expect(r.profit).toBe(67.5);
    expect(r.endingCash).toBe(782.5);
    expect(r.endingCash).toBe(
      r.openingCash -
        r.investments -
        r.variableCost -
        r.wages -
        r.fixedExpenses +
        r.revenue,
    );
  });
  it("purchases each upgrade once, immediately and without mutating input", () => {
    for (const u of upgrades) {
      const s = initial(),
        b = purchase(s, u.id);
      expect(s.cash).toBe(700);
      expect(b.cash).toBe(700 - u.cost);
      expect(b.quality).toBe(50 + (u.quality ?? 0));
      expect(b.capacity).toBe(40 + (u.capacity ?? 0));
      expect(b.equipment).toBe(300 + (u.equipment ?? 0));
      expect(() => purchase(b, u.id)).toThrow();
    }
  });
  it("does not classify training as equipment", () =>
    expect(purchase(initial(), "training").equipment).toBe(300));
  it("rejects unaffordable investments and mandatory operating costs", () => {
    expect(() => purchase({ ...initial(), cash: 30 }, "training")).toThrow();
    expect(() => preview({ ...initial(), cash: 100 })).toThrow();
    expect(preview({ ...initial(), cash: 110 }).quantity).toBe(0);
  });
  it("keeps capex out of profit and deducts expenses once", () => {
    const s = purchase(purchase(initial(), "dryer"), "training"),
      r = preview(s);
    expect(r.investments).toBe(160);
    expect(r.investmentExpenses).toBe(40);
    expect(r.profit).toBe(r.operatingProfit - 40);
    expect(r.endingCash).toBeCloseTo(
      700 - 160 - r.variableCost - 110 + r.revenue,
    );
    const next = preview(advance(s));
    expect(next.investments).toBe(0);
    expect(next.investmentExpenses).toBe(0);
  });
  it("validates international eligibility independently of selection", () => {
    expect(lockedReason(initial(), "rcep")).toBeTruthy();
    expect(() => preview({ ...initial(), market: "eu" })).toThrow();
    const s = purchase(
      purchase(purchase(initial(), "sorter"), "training"),
      "traceability",
    );
    expect(lockedReason(s, "eu")).toBeNull();
  });
  it("applies quarterly events without cumulative duplication", () => {
    let s = initial();
    s = advance(advance(advance(s)));
    expect(preview(s)).toEqual(preview(s));
    expect(preview(s).turnoverDays).toBe(75);
    const upgraded = purchase(s, "logistics");
    expect(preview(upgraded).turnoverDays).toBe(55);
  });
  it("prevents a fifth simulation and preserves history", () => {
    let s = initial();
    for (let q = 0; q < 4; q++) s = advance(s);
    expect(s.history).toHaveLength(4);
    expect(() => advance(s)).toThrow();
    expect(() => purchase(s, "dryer")).toThrow();
  });
  it("reproduces scenarios, keeps balances nonnegative, reconciles every quarter", () => {
    const pair = scenarios();
    expect(pair).toEqual(scenarios());
    for (const s of [pair.a, pair.b]) {
      expect(s.history).toHaveLength(4);
      for (const r of s.history) {
        expect(r.endingCash).toBeGreaterThanOrEqual(0);
        expect(r.endingCash).toBeCloseTo(
          r.openingCash -
            r.investments -
            r.variableCost -
            r.wages -
            r.fixedExpenses +
            r.revenue,
        );
      }
      expect(score(s).total).toBeLessThanOrEqual(100);
      expect(score(s).total).toBeGreaterThanOrEqual(0);
    }
  });
});
